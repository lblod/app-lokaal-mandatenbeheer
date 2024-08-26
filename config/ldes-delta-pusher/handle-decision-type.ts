import { query } from "mu";
import { Changeset } from "../types";

import { publishInterestingSubjects } from "./handle-types-util";
import { InterestingSubject } from "./publisher"

const regularTypesToLDESMapping = {
  "http://data.vlaanderen.be/ns/besluit#Artikel": "public",
  "http://data.vlaanderen.be/ns/besluit#Besluit": "public",
}

const interestingSubjects = async (subjects: string[]): Promise<InterestingSubject[]> => {
  const types = Object.keys(regularTypesToLDESMapping);
  const matches = await query(`
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>

    SELECT DISTINCT ?s ?type
    WHERE {
      ?s a ?type .
      VALUES ?type { ${types.map((type) => `<${type}>`).join(" ")} }
      VALUES ?s { ${[...subjects].map((subject) => `<${subject}>`).join(" ")} }

      ?s ?predicate ?mandataris.
      FILTER ( ?predicate = mandaat:bekrachtigtAanstellingVan || ?predicate = mandaat:bekrachtigtOntslagVan )
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
}

export const handleDecisionType = async (changesets: Changeset[]) => {
  await publishInterestingSubjects(changesets, interestingSubjects);
};