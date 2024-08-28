export default [
  {
    match: {
      predicate: {
        type: 'uri',
        value: 'http://data.vlaanderen.be/ns/mandaat#bekrachtigtAanstellingVan',
      },
      predicate: {
        type: 'uri',
        value: 'http://data.vlaanderen.be/ns/mandaat#bekrachtigtOntslagVan',
      },
      graph: {
        type: 'uri',
        value: 'http://mu.semte.ch/graphs/besluiten-consumed',
      },
    },
    callback: {
      url: 'http://mandataris/delta/decisions',
      method: 'POST',
    },
    options: {
      resourceFormat: 'v0.0.1',
      gracePeriod: 1000,
      retry: 0,
      ignoreFromSelf: true,
      retryTimeout: 250,
    },
  },
]
