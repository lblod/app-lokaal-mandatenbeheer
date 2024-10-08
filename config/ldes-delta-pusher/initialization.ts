import { ldesInstances } from "./ldes-instances";

// this is so we can relate our instances to the bestuurseenheid they concern
const extraConstruct = `
  ?versionedS <http://mu.semte.ch/vocabularies/ext/relatedTo> ?bestuurseenheid.
`;
const extraWhere = `
  GRAPH ?g {
    ?s a ?thing.
  }
  GRAPH <http://mu.semte.ch/graphs/public> {
    ?g <http://mu.semte.ch/vocabularies/ext/ownedBy> ?bestuurseenheid.
  }
`;

export const initialization = {};

Object.keys(ldesInstances).forEach((stream) => {
  const initializationStream = {};
  initialization[stream] = initializationStream;

  Object.keys(ldesInstances[stream].entities).forEach((type) => {
    const typeConfig = {
      extraConstruct,
      extraWhere,
      filter: "",
    };
    const definition = ldesInstances[stream].entities[type];
    if (definition.instanceFilter) {
      typeConfig.filter = definition.instanceFilter;
    }
    initializationStream[type] = typeConfig;
  });
});
