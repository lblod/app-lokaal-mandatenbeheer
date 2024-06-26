import { Changeset } from "../types";
import { query } from "mu";
import {
  InterestingSubject,
  publishInterestingSubjects,
} from "./handle-types-util";

const regularTypesToLDESMapping = {
  "http://data.vlaanderen.be/ns/mandaat#Fractie": "public",
  "http://www.w3.org/ns/org#Membership": "public",
  "http://data.vlaanderen.be/ns/mandaat#Mandaat": "public",
  "http://www.w3.org/ns/person#Person": "public",
  "http://purl.org/dc/terms/PeriodOfTime": "public",
  "http://www.w3.org/ns/adms#Identifier": "abb",
  "http://data.vlaanderen.be/ns/persoon#Geboorte": "public",
  "http://schema.org/ContactPoint": "abb",
  "http://www.w3.org/ns/locn#Address": "abb",
};

export const getLdesForRegularType = (type: string) => {
  return regularTypesToLDESMapping[type];
};

const keepRegularTypesQuery = async (
  subjects: string[]
): Promise<InterestingSubject[]> => {
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
      const ldesType = getLdesForRegularType(binding.type.value);
      if (!ldesType) {
        return null;
      }
      return { uri: binding.s.value, ldesType, type: binding.type.value };
    })
    .filter((b) => !!b);
};

export const handleRegularTypes = async (changesets: Changeset[]) => {
  await publishInterestingSubjects(changesets, keepRegularTypesQuery);
};
