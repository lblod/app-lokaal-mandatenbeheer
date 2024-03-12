import { Changeset } from "../types";
import { query } from "mu";
import {
  InterestingSubject,
  publishInterestingSubjects,
} from "./handle-types-util";

const regularTypesToLDESMapping = {
  "http://data.vlaanderen.be/ns/mandaat#Fractie": "fractie",
  "http://www.w3.org/ns/org#Membership": "lidmaatschap",
  "http://data.vlaanderen.be/ns/mandaat#Mandaat": "mandaat",
  "http://www.w3.org/ns/person#Person": "persoon",
  "http://purl.org/dc/terms/PeriodOfTime": "periode",
  "http://www.w3.org/ns/adms#Identifier": "identifier",
  "http://data.vlaanderen.be/ns/persoon#Geboorte": "geboorte",
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
      const ldesType = regularTypesToLDESMapping[binding.type.value];
      if (!ldesType) {
        return null;
      }
      return { uri: binding.s.value, ldesType };
    })
    .filter((b) => !!b);
};

export const handleRegularTypes = async (changesets: Changeset[]) => {
  await publishInterestingSubjects(changesets, keepRegularTypesQuery);
};
