export default [
  {
    match: {
      subject: {},
    },
    callback: {
      url: "http://modified/delta",
      method: "POST",
    },
    options: {
      resourceFormat: "v0.0.1",
      gracePeriod: 10000,
      retry: 3,
      ignoreFromSelf: true,
      retryTimeout: 250,
    },
  },
];
