export default {
  endpoints: [
    {
      name: "ABB Stream Aalst",
      LDES_BASE: "https://lokaalmandatenbeheer.decursor.net/streams/ldes/abb/",
      FIRST_PAGE: "https://lokaalmandatenbeheer.decursor.net/streams/ldes/abb/1",
      TARGET_GRAPH: "http://mu.semte.ch/graphs/public",
      STATUS_GRAPH: "http://mu.semte.ch/graphs/locally-managed/status",
      EXTRA_HEADERS: {
        "authorization": "Basic <TOKEN>"
      },
      VERSION_PREDICATE: "http://purl.org/dc/terms/isVersionOf",
      TIME_PREDICATE: "http://www.w3.org/ns/prov#generatedAtTime",
    },
  ],
};
