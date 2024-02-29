import { Changeset } from "../types";
import { query } from "mu";
import { publish } from "./publisher";
import { log } from "./logger";

type InterestingSubject = {
  uri: string;
  ldesType: string;
};

const regularTypesToLDESMapping = {
  "http://data.vlaanderen.be/ns/mandaat#Fractie": "fractie",
  "http://www.w3.org/ns/org#Membership": "lidmaatschap",
  "http://data.vlaanderen.be/ns/mandaat#Mandaat": "mandaat",
  "http://www.w3.org/ns/person#Person": "persoon",
  "http://purl.org/dc/terms/PeriodOfTime": "periode",
  "http://purl.org/dc/terms/Identifier": "identifier",
  "http://data.vlaanderen.be/ns/persoon#Geboorte": "geboorte",
};

const keepRegularTypesQuery = async (subjects: string[]) => {
  const types = Object.keys(regularTypesToLDESMapping);
  const matches = await query(`
      SELECT DISTINCT ?s ?type WHERE {
        ?s a ?type .
        VALUES ?type { ${types.map((type) => `<${type}>`).join(" ")} }
        VALUES ?s { ${[...subjects]
          .map((subject) => `<${subject}>`)
          .join(" ")} }
      }
    `);
  return matches.results.bindings
    .map((binding) => {
      const ldesType = regularTypesToLDESMapping[binding.type.value];
      if (!ldesType) {
        return null;
      }
      return { uri: binding.s.value, ldesType };
    })
    .filter((b) => !!b) as InterestingSubject[];
};

const keepRegularTypeSubjects = async (changesets: Changeset[]) => {
  const subjects = new Set<string>();
  for (const changeset of changesets) {
    changeset.inserts.forEach((insert) => {
      subjects.add(insert.subject.value);
    });
    changeset.deletes.forEach((del) => {
      subjects.add(del.subject.value);
    });
  }

  const allSubjects = [...subjects];
  let subjectsToKeep: InterestingSubject[] = [];
  const chunkSize = 1000;
  for (let i = 0; i < allSubjects.length; i += chunkSize) {
    const currentChunk = allSubjects.slice(i, i + chunkSize);
    const toKeepForChunk = await keepRegularTypesQuery(currentChunk);
    subjectsToKeep = subjectsToKeep.concat(toKeepForChunk);
  }

  return subjectsToKeep;
};

export const handleRegularTypes = async (changesets: Changeset[]) => {
  const interestingSubjects = await keepRegularTypeSubjects(changesets);
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
