import { v4 as uuid } from 'uuid';
import config from './config';

export const RANDOMIZE_GRAPHS =
  (process.env.RANDOMIZE_GRAPHS || 'false') === 'true';
export const CRON_PATTERN = process.env.CRON_PATTERN || '*/5 * * * * *';
export const LDES_BASE = process.env.LDES_BASE;
export const FIRST_PAGE =
  process.env.FIRST_PAGE ||
  'https://dev.mandatenbeheer.lblod.info/streams/ldes/public/1';
export const WORKING_GRAPH =
  (process.env.WORKING_GRAPH || 'http://mu.semte.ch/graphs/temp') +
  (RANDOMIZE_GRAPHS ? `/${uuid()}` : '');
export const BATCH_GRAPH =
  (process.env.BATCH_GRAPH || 'http://mu.semte.ch/graphs/batch') +
  (RANDOMIZE_GRAPHS ? `/${uuid()}` : '');
export const BATCH_SIZE = process.env.BATCH_SIZE || 1000;
export const STATUS_GRAPH =
  process.env.STATUS_GRAPH || 'http://mu.semte.ch/graphs/status';
export const TARGET_GRAPH =
  process.env.TARGET_GRAPH || 'http://mu.semte.ch/graphs/public';
export const DIRECT_DATABASE_CONNECTION =
  process.env.DIRECT_DATABASE_CONNECTION || 'http://virtuoso:8890/sparql';
export const GRAPH_STORE_URL =
  process.env.GRAPH_STORE_URL || 'http://virtuoso:8890/sparql-graph-crud';
export const VERSION_PREDICATE =
  process.env.VERSION_PREDICATE || 'http://purl.org/dc/terms/isVersionOf';
export const TIME_PREDICATE =
  process.env.TIME_PREDICATE || 'http://www.w3.org/ns/prov#generatedAtTime';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
export const EXTRA_HEADERS = JSON.parse(process.env.EXTRA_HEADERS || '{}');
export const BYPASS_MU_AUTH =
  (process.env.BYPASS_MU_AUTH || 'false') === 'true';
export const RUN_AT_STARTUP =
  (process.env.RUN_AT_STARTUP || 'false') === 'true';

const DEFAULT_NEXT_PAGE_RELATIONSHIP_RDF_TYPE =
  'https://w3id.org/tree#GreaterThanOrEqualToRelation';
export const NEXT_PAGE_RELATIONSHIP_RDF_TYPE =
  process.env.NEXT_PAGE_RELATIONSHIP_RDF_TYPE ||
  DEFAULT_NEXT_PAGE_RELATIONSHIP_RDF_TYPE;

let currentStream = 0;

export const environment = {
  CRON_PATTERN,
  WORKING_GRAPH,
  BATCH_GRAPH,
  BATCH_SIZE,
  DIRECT_DATABASE_CONNECTION,
  GRAPH_STORE_URL,
  LOG_LEVEL,
  BYPASS_MU_AUTH,
  RANDOMIZE_GRAPHS,
  // getters for the other properties so we can loop over multiple streams defined in the config
  // if LDES_BASE is set, use the environment variables and don't look at the config file, if it isn't set, use the config file
  getLdesBase() {
    if (LDES_BASE) {
      return LDES_BASE;
    }
    return config.endpoints[currentStream].LDES_BASE;
  },
  getFirstPage() {
    if (LDES_BASE) {
      return FIRST_PAGE;
    }
    return config.endpoints[currentStream].FIRST_PAGE;
  },
  getTargetGraph() {
    if (LDES_BASE) {
      return TARGET_GRAPH;
    }
    return config.endpoints[currentStream].TARGET_GRAPH;
  },
  getStatusGraph() {
    if (LDES_BASE) {
      return STATUS_GRAPH;
    }
    return config.endpoints[currentStream].STATUS_GRAPH;
  },
  getExtraHeaders() {
    if (LDES_BASE) {
      return EXTRA_HEADERS;
    }
    return config.endpoints[currentStream].EXTRA_HEADERS;
  },
  getVersionPredicate() {
    if (LDES_BASE) {
      return VERSION_PREDICATE;
    }
    return config.endpoints[currentStream].VERSION_PREDICATE;
  },
  getTimePredicate() {
    if (LDES_BASE) {
      return TIME_PREDICATE;
    }
    return config.endpoints[currentStream].TIME_PREDICATE;
  },
  getNextPageRelationshipRdfType() {
    if (LDES_BASE) {
      return NEXT_PAGE_RELATIONSHIP_RDF_TYPE;
    }
    return (
      config.endpoints[currentStream].NEXT_PAGE_RELATIONSHIP_RDF_TYPE ||
      DEFAULT_NEXT_PAGE_RELATIONSHIP_RDF_TYPE
    );
  },
  getCurrentStreamConfig() {
    return config.endpoints[currentStream];
  },
  resetCurrentStream() {
    currentStream = 0;
  },
  toNextStream() {
    currentStream++;
    if (currentStream >= config.endpoints.length) {
      currentStream = 0;
    }
    return currentStream != 0;
  },
};