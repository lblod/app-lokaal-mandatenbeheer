import { Changeset } from "../types";
import { query } from "mu";
import {
  InterestingSubject,
  publishInterestingSubjects,
} from "./handle-types-util";

const keepMandatarisTypesQuery = async (
  subjects: string[]
): Promise<InterestingSubject[]> => {
  const matches = await query(`
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>

      SELECT DISTINCT ?s ?isDraft
      WHERE {
        ?s a mandaat:Mandataris.
        VALUES ?s { ${[...subjects]
          .map((subject) => `<${subject}>`)
          .join(" ")} }
        OPTIONAL { ?s ext:isDraft ?isDraft. }
      }
    `);
  return matches.results.bindings
    .map((binding) => {
      const isDraft = binding.isDraft?.value === "true"; // default to non-draft if not present
      const ldesType = isDraft ? "mandataris-draft" : "mandataris";
      return { uri: binding.s.value, ldesType };
    })
    .filter((b) => !!b) as InterestingSubject[];
};

export const handleMandatarisType = async (changesets: Changeset[]) => {
  await publishInterestingSubjects(changesets, keepMandatarisTypesQuery);
};
