export default [
  {
    match: {
      predicate: {
        type: 'uri',
        value: 'http://mu.semte.ch/vocabularies/ext/bekrachtigtAanstellingVan',
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
