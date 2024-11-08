import { querySudo } from "@lblod/mu-auth-sudo";
import { Changeset } from "../types";
import { publishInterestingSubjects } from "./handle-types-util";
import { InterestingSubject } from "./publisher";
import { MANDATARIS_DRAFT_STATE } from "./utils/well-known-uris";

export const toMandatarisDraftState = async (subjects: string[]) => {
  const matches = await querySudo(`
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
      PREFIX lmb: <http://lblod.data.gift/vocabularies/lmb/>

      SELECT DISTINCT ?s ?publicationStatus
      WHERE {
        GRAPH ?g {
          ?s a mandaat:Mandataris.
          VALUES ?s { ${[...subjects]
            .map((subject) => `<${subject}>`)
            .join(" ")} }
          OPTIONAL { ?s lmb:hasPublicationStatus ?publicationStatus. }
        }
        ?g <http://mu.semte.ch/vocabularies/ext/ownedBy> ?bestuurseenheid.
      }
    `);
  return matches.results.bindings;
};

const keepMandatarisTypesQuery = async (
  subjects: string[]
): Promise<InterestingSubject[]> => {
  const subjectsWithDraftState = await toMandatarisDraftState(subjects);
  return subjectsWithDraftState
    .map((binding) => {
      const isNotDraft =
        binding.publicationStatus?.value !== MANDATARIS_DRAFT_STATE;
      const ldesType = isNotDraft ? "public" : "abb"; // default to non-draft if not present
      return {
        uri: binding.s.value,
        ldesType,
        type: "http://data.vlaanderen.be/ns/mandaat#Mandataris",
      };
    })
    .filter((b) => !!b) as InterestingSubject[];
};

export const handleMandatarisType = async (changesets: Changeset[]) => {
  await publishInterestingSubjects(changesets, keepMandatarisTypesQuery);
};
