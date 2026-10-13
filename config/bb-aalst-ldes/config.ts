export default {
  endpoints: [
    {
      name: "Public Stream",
      LDES_BASE: process.env.LDES_BASE,
      FIRST_PAGE: process.env.FIRST_PAGE,
      TARGET_GRAPH: process.env.TARGET_GRAPH,
      STATUS_GRAPH: process.env.STATUS_GRAPH,
      EXTRA_HEADERS: process.env.EXTRA_HEADERS,
      VERSION_PREDICATE: process.env.VERSION_PREDICATE,
      TIME_PREDICATE: process.env.TIME_PREDICATE,
    },
  ],
};
