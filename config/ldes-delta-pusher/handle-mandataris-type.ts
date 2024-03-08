import { Changeset } from "../types";
import { query } from "mu";
import { publish } from "./publisher";
import { log } from "./logger";

type InterestingSubject = {
  uri: string;
  ldesType: string;
};

const keepRegularTypesQuery = async (subjects: string[]) => {
  const matches = await query(`
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>

      SELECT DISTINCT ?s ?isDraft
      WHERE {
        ?s a mandaat:Mandataris.
        VALUES ?s { ${[...subjects]
          .map((subject) => `<${subject}>`)
          .join(" ")} }
        ?s ext:isDraft ?isDraft.
      }
    `);
  return matches.results.bindings
    .map((binding) => {
      const isDraft = binding.isDraft.value === "true";
      const ldesType = isDraft ? "mandataris-draft" : "mandataris";
      return { uri: binding.s.value, ldesType };
    })
    .filter((b) => !!b) as InterestingSubject[];
};

const keepMandatarisTypeSubjects = async (changesets: Changeset[]) => {
  const subjects = new Set<string>();
  for (const changeset of changesets) {
    changeset.inserts.forEach((insert) => {
      subjects.add(insert.subject.value);
    });
    changeset.deletes.forEach((del) => {
      subjects.add(del.subject.value);
    });
  }

  const allSubjects = Array.from(subjects);
  let subjectsToKeep: InterestingSubject[] = [];
  const chunkSize = 1000;
  for (let i = 0; i < allSubjects.length; i += chunkSize) {
    const currentChunk = allSubjects.slice(i, i + chunkSize);
    const toKeepForChunk = await keepRegularTypesQuery(currentChunk);
    subjectsToKeep = subjectsToKeep.concat(toKeepForChunk);
  }

  return subjectsToKeep;
};

export const handleMandatarisType = async (changesets: Changeset[]) => {
  const interestingSubjects = await keepMandatarisTypeSubjects(changesets);
  log(
    `Received changeset(s) touching the following interesting subjects:\n${JSON.stringify(
      interestingSubjects
    )}`,
    "debug"
  );

  // do this serially to avoid overloading the stream endpoint
  let current: InterestingSubject | undefined;
  while ((current = interestingSubjects.pop())) {
    await publish(current.ldesType, current.uri);
  }
};
