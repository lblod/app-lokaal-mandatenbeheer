export default [
  {
    match: {
      subject: {},
      graph: {
        type: 'uri',
        value: 'http://mu.semte.ch/graphs/besluiten-consumed',
      },
    },
    callback: {
      url: 'http://mandataris/mandatees-decisions',
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
