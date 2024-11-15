const { parallelizedBatchedUpdate } = require('./utils')
const {
  BYPASS_MU_AUTH_FOR_EXPENSIVE_QUERIES,
  DIRECT_DATABASE_ENDPOINT,
  MU_CALL_SCOPE_ID_INITIAL_SYNC,
  BATCH_SIZE,
  SLEEP_BETWEEN_BATCHES,
  INGEST_GRAPH,
  PARALLEL_CALLS,
} = require('./config')

const endpoint = BYPASS_MU_AUTH_FOR_EXPENSIVE_QUERIES
  ? DIRECT_DATABASE_ENDPOINT
  : process.env.MU_SPARQL_ENDPOINT

/**
 * Dispatch the fetched information to a target graph.
 * @param { mu, muAuthSudo, fetch } lib - The provided libraries from the host service.
 * @param { termObjects } data - The fetched quad information, which objects of serialized Terms
 *          [ {
 *              graph: "<http://foo>",
 *              subject: "<http://bar>",
 *              predicate: "<http://baz>",
 *              object: "<http://boom>^^<http://datatype>"
 *            }
 *         ]
 * @return {void} Nothing
 */
async function dispatch(lib, data) {
  const { mu } = lib

  const triples = data.termObjects.map(
    (o) => `${o.subject} ${o.predicate} ${o.object}.`
  )
  console.log(`|> INITIAL SYNC DISPATCH, triples:`, triples.length)

  if (BYPASS_MU_AUTH_FOR_EXPENSIVE_QUERIES) {
    console.warn(`Service configured to skip MU_AUTH!`)
  }
  console.log(`Using ${endpoint} to insert triples`)

  await parallelizedBatchedUpdate(
    lib,
    triples,
    INGEST_GRAPH,
    SLEEP_BETWEEN_BATCHES,
    BATCH_SIZE,
    { 'mu-call-scope-id': MU_CALL_SCOPE_ID_INITIAL_SYNC },
    endpoint,
    'INSERT',
    //If we don't bypass mu-auth already from the start, we provide a direct database endpoint
    // as fallback
    !BYPASS_MU_AUTH_FOR_EXPENSIVE_QUERIES ? DIRECT_DATABASE_ENDPOINT : '',
    PARALLEL_CALLS
  )
}

/**
 * A callback you can override to do extra manipulations
 *   after initial ingest.
 * @param { mu, muAuthSudo, fetch } lib - The provided libraries from the host service.
 * @return {void} Nothing
 */
async function onFinishInitialIngest(_lib) {
  console.log(`
    onFinishInitialIngest was called!
    Current implementation does nothing, no worries.
    You can overrule it for extra manipulations after initial ingest.
  `)
}

module.exports = {
  dispatch,
  onFinishInitialIngest,
}
