export default {
  endpoints: [
    {
      name: "Public Stream",
      LDES_BASE: "http://ldes-backend/public/", // note: in real life this would be an external endpoint, probably with a longer path like streams/ldes/public, same for the first page
      FIRST_PAGE: "http://ldes-backend/public/1",
      TARGET_GRAPH: "http://mu.semte.ch/graphs/public",
      STATUS_GRAPH: "http://mu.semte.ch/graphs/locally-managed/status",
      EXTRA_HEADERS: {},
      VERSION_PREDICATE: "http://purl.org/dc/terms/isVersionOf",
      TIME_PREDICATE: "http://www.w3.org/ns/prov#generatedAtTime",
    },
    {
      name: "Abb Stream",
      LDES_BASE: "http://authorization-wrapper/abb/",
      FIRST_PAGE: "http://authorization-wrapper/abb/1",
      TARGET_GRAPH: "http://mu.semte.ch/graphs/public",
      STATUS_GRAPH: "http://mu.semte.ch/graphs/locally-managed/status",
      EXTRA_HEADERS: {
        Authorization:
          "Basic aHR0cDovL2RhdGEubGJsb2QuaW5mby92ZW5kb3JzL2Zha2llOmZha2ll", // this one's fake: stands for http://data.vlaanderen.be/fakie:fake
      },
      VERSION_PREDICATE: "http://purl.org/dc/terms/isVersionOf",
      TIME_PREDICATE: "http://www.w3.org/ns/prov#generatedAtTime",
    },
  ],
};
