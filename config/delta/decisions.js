export default [
  {
    match: {
      predicate: {
        type: "uri",
        value: "http://data.vlaanderen.be/ns/mandaat#bekrachtigtAanstellingVan",
      },
    },
    callback: {
      url: "http://mandataris/delta/decisions",
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
  {
    match: {
      predicate: {
        type: "uri",
        value: "http://data.vlaanderen.be/ns/mandaat#bekrachtigtOntslagVan",
      },
    },
    callback: {
      url: "http://mandataris/delta/decisions",
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
