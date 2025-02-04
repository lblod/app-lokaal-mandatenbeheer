import { querySudo } from "@lblod/mu-auth-sudo";
import { sparqlEscapeUri } from "mu";
import { Changeset } from "../types";

import { publishInterestingSubjects } from "./handle-types-util";
import { InterestingSubject, LDES_TYPE, TypesWithFilter } from "./publisher";
import { ldesInstances } from "./ldes-instances";

const regularTypesToLDESMapping: {
  [key: string]: LDES_TYPE | TypesWithFilter;
} = {};

Object.keys(ldesInstances).forEach((stream) => {
  Object.keys(ldesInstances[stream].entities).forEach((type) => {
    const definition = ldesInstances[stream].entities[type];
    // ignore the special types, they are handled in separate files
    if (definition.specialType) {
      return;
    }
    regularTypesToLDESMapping[type] = regularTypesToLDESMapping[type] || {};
    const filter = ldesInstances[stream].entities[type].instanceFilter;
    if (filter) {
      regularTypesToLDESMapping[type][stream] = {
        filter,
      };
    } else {
      regularTypesToLDESMapping[type][stream] = {};
    }
  });
});

export const getLdesForRegularType = (type: string) => {
  return regularTypesToLDESMapping[type];
};

const keepRegularTypesQuery = async (
  subjects: string[]
): Promise<InterestingSubject[]> => {
  const types = Object.keys(regularTypesToLDESMapping);
  const matches = await querySudo(`
      SELECT DISTINCT ?s ?type WHERE {
        GRAPH ?g {
          ?s a ?type .
        }
        ?g <http://mu.semte.ch/vocabularies/ext/ownedBy> ?bestuurseenheid.

        VALUES ?type { ${types.map((type) => sparqlEscapeUri(type)).join(" ")} }
        VALUES ?s { ${[...subjects]
          .map((subject) => sparqlEscapeUri(subject))
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
