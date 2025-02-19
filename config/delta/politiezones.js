export default [
  {
    match: {
      predicate: {
        type: "uri",
        value: "http://purl.org/dc/terms/modified",
      },
    },
    callback: {
      url: "http://mandataris/delta/politiezones",
      method: "POST",
    },
    options: {
      resourceFormat: "v0.0.1",
      gracePeriod: 1000,
      retry: 0,
      ignoreFromSelf: true,
      retryTimeout: 250,
    },
  },
];
