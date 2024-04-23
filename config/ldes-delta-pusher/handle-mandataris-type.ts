import { Changeset } from "../types";
import { query } from "mu";
import {
  InterestingSubject,
  publishInterestingSubjects,
} from "./handle-types-util";
import { MANDATARIS_DRAFT_STATE } from "./utils/well-known-uris";

const keepMandatarisTypesQuery = async (
  subjects: string[]
): Promise<InterestingSubject[]> => {
  const matches = await query(`
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
      PREFIX extlmb: <http://mu.semte.ch/vocabularies/ext/lmb/>

      SELECT DISTINCT ?s ?publicationStatus
      WHERE {
        ?s a mandaat:Mandataris.
        VALUES ?s { ${[...subjects]
          .map((subject) => `<${subject}>`)
          .join(" ")} }
        OPTIONAL { ?s extlmb:hasPublicationStatus ?publicationStatus. }
      }
    `);
  return matches.results.bindings
    .map((binding) => {
      const isNotDraft =
        binding.publicationStatus?.value !== MANDATARIS_DRAFT_STATE;
      const ldesType = isNotDraft ? "mandataris" : "mandataris-draft"; // default to non-draft if not present
      return { uri: binding.s.value, ldesType };
    })
    .filter((b) => !!b) as InterestingSubject[];
};

export const handleMandatarisType = async (changesets: Changeset[]) => {
  await publishInterestingSubjects(changesets, keepMandatarisTypesQuery);
};
