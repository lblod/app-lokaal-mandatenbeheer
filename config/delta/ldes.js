export default [
  {
    match: {
      subject: {},
    },
    callback: {
      url: "http://ldes-delta-pusher/publish",
      method: "POST",
    },
    options: {
      resourceFormat: "v0.0.1",
      gracePeriod: 10000,
      retry: 3,
      retryTimeout: 250,
    },
  },
];
