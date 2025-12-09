import {
  LDES_BASE,
  FIRST_PAGE,
  TARGET_GRAPH,
  STATUS_GRAPH,
  EXTRA_HEADERS,
  VERSION_PREDICATE,
  TIME_PREDICATE,
} from "../environment";

export default {
  endpoints: [
    {
      name: "Public Stream",
      LDES_BASE,
      FIRST_PAGE,
      TARGET_GRAPH,
      STATUS_GRAPH,
      EXTRA_HEADERS,
      VERSION_PREDICATE,
      TIME_PREDICATE,
    },
  ],
};
