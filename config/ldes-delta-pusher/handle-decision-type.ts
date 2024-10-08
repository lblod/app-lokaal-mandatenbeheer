import { Changeset } from "../types";
import { querySudo } from "@lblod/mu-auth-sudo";

import { publishInterestingSubjects } from "./handle-types-util";
import { InterestingSubject } from "./publisher";

const regularTypesToLDESMapping = {
  "http://data.vlaanderen.be/ns/besluit#Artikel": "public",
  "http://data.vlaanderen.be/ns/besluit#Besluit": "public",
};

const interestingSubjects = async (
  subjects: string[]
): Promise<InterestingSubject[]> => {
  const types = Object.keys(regularTypesToLDESMapping);
  const matches = await querySudo(`
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>

    SELECT DISTINCT ?s ?type
    WHERE {
      GRAPH ?g {
        ?s a ?type .
        VALUES ?type { ${types.map((type) => `<${type}>`).join(" ")} }
        VALUES ?s { ${[...subjects]
          .map((subject) => `<${subject}>`)
          .join(" ")} }

        ?s ?predicate ?mandataris.
        FILTER ( ?predicate = mandaat:bekrachtigtAanstellingVan || ?predicate = mandaat:bekrachtigtOntslagVan )
      }
      ?g <http://mu.semte.ch/vocabularies/ext/ownedBy> ?bestuurseenheid.
    }
  `);
  return matches.results.bindings
    .map((binding) => {
      const ldesType = regularTypesToLDESMapping[binding.type.value];
      if (!ldesType) {
        return null;
      }
      return { uri: binding.s.value, ldesType, type: binding.type.value };
    })
    .filter((b) => !!b);
};

export const handleDecisionType = async (changesets: Changeset[]) => {
  await publishInterestingSubjects(changesets, interestingSubjects);
};
