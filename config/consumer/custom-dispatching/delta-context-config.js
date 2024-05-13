// FROM https://github.com/lblod/delta-consumer/blob/master/triples-dispatching/example-custom-dispatching-reasoning-with-context/consumer/delta-context-config.js

const PREFIXES = `
PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>`

const contextConfig = {
  addTypes: {
    scope: 'all',
    exhausitive: false,
  },
  contextQueries: [
    {
      trigger: {
        subjectType: "besluit:Artikel"
      },
      queryTemplate: (subject) => `
        ${PREFIXES}
        CONSTRUCT {
          ?artikel a besluit:Artikel .
          ?artikel ?p ?o .
        } WHERE {
          GRAPH <http://mu.semte.ch/graphs/public> {
            ?artikel a besluit:Artikel .
            ?artikel ?p ?o .
          }
        }`
    },
  ]
}

export default {
  contextConfig,
  PREFIXES
};