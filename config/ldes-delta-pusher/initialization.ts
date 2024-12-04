import { ldesInstances } from "./ldes-instances";
import { sparqlEscapeUri } from "mu";

// this is so we can relate our instances to the bestuurseenheid they concern
const extraConstruct = `
  ?versionedS <http://mu.semte.ch/vocabularies/ext/relatedTo> ?bestuurseenheid.
`;
const extraWhere = ``;

export const initialization = {};

Object.keys(ldesInstances).forEach((stream) => {
  const initializationStream = {};
  initialization[stream] = initializationStream;

  Object.keys(ldesInstances[stream].entities).forEach((type) => {
    const transformPredicates =
      ldesInstances[stream].entities[type].transformPredicates;
    const transformTypes = ldesInstances[stream].entities[type].transformTypes;
    let transformedExtraWhere = extraWhere;
    let transformedExtraConstruct = extraConstruct;
    if (transformPredicates) {
      let mapping = "";
      Object.keys(transformPredicates).forEach((from) => {
        const to = transformPredicates[from];
        mapping += `(${sparqlEscapeUri(from)} ${sparqlEscapeUri(to)})\n`;
      });
      // if constructs are more efficient than mappings here sadly
      const ifConstructs = Object.keys(transformPredicates).map((from) => {
        const fromSafe = sparqlEscapeUri(from);
        const toSafe = sparqlEscapeUri(transformPredicates[from]);
        return `IF(?p = ${fromSafe}, ${toSafe}, `;
      });
      const ifConstructsString = `${ifConstructs.join("")} ?p ${")".repeat(
        ifConstructs.length
      )}`;

      transformedExtraWhere = `${extraWhere}

      BIND(${ifConstructsString} AS ?pNew)`;
      transformedExtraConstruct = `${extraConstruct}
      ?versionedS ?pNew ?o.`;
    }
    if (transformTypes) {
      const extraTypes = transformTypes
        .map((type) => `${sparqlEscapeUri(type)}`)
        .join(", ");
      transformedExtraConstruct = `${extraConstruct}
      ?versionedS a ${extraTypes}.`;
    }
    const typeConfig = {
      extraConstruct: transformedExtraConstruct,
      extraWhere: transformedExtraWhere,
      filter: "",
      graphFilter: "",
    };
    const definition = ldesInstances[stream].entities[type];
    if (definition.instanceFilter) {
      typeConfig.filter = definition.instanceFilter;
    }
    if (ldesInstances[stream].graphFilter) {
      typeConfig.graphFilter = ldesInstances[stream].graphFilter;
    }
    initializationStream[type] = typeConfig;
  });
});
