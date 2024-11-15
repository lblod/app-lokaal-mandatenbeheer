const { BYPASS_MU_AUTH_FOR_EXPENSIVE_QUERIES,
  DIRECT_DATABASE_ENDPOINT,
  BATCH_SIZE,
  SLEEP_BETWEEN_BATCHES,
  INGEST_GRAPH,
  PARALLEL_CALLS
} = require('./config');
const { parallelizedBatchedUpdate } = require('./utils');
const endpoint = BYPASS_MU_AUTH_FOR_EXPENSIVE_QUERIES ? DIRECT_DATABASE_ENDPOINT : process.env.MU_SPARQL_ENDPOINT; //Defaults to mu-auth


/**
 * Dispatch the fetched information to a target graph.
 * @param { mu, muAuthSudo, fetch } lib - The provided libraries from the host service.
 * @param { termObjectChangeSets: { deletes, inserts } } data - The fetched changes sets, which objects of serialized Terms
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
  const { mu, } = lib;
  const { termObjectChangeSets } = data;

  for (let { deletes, inserts } of termObjectChangeSets) {
    console.log(`|> DELTA SYNC DISPATCH, deletes:`, deletes.length)
    console.log(`|> DELTA SYNC DISPATCH, inserts:`, inserts.length)

    if (BYPASS_MU_AUTH_FOR_EXPENSIVE_QUERIES) {
      console.warn(`Service configured to skip MU_AUTH!`);
    }
    console.log(`Using ${endpoint} to insert triples`);

    const deleteStatements = deletes.map(o => `${o.subject} ${o.predicate} ${o.object}.`);
    await parallelizedBatchedUpdate(
      lib,
      deleteStatements,
      INGEST_GRAPH,
      SLEEP_BETWEEN_BATCHES,
      BATCH_SIZE,
      {},
      endpoint,
      "DELETE",
      //If we don't bypass mu-auth already from the start, we provide a direct database endpoint
      // as fallback
      !BYPASS_MU_AUTH_FOR_EXPENSIVE_QUERIES ? DIRECT_DATABASE_ENDPOINT : '',
      PARALLEL_CALLS
    );

    const insertStatements = inserts.map(o => `${o.subject} ${o.predicate} ${o.object}.`);
    await parallelizedBatchedUpdate(
      lib,
      insertStatements,
      INGEST_GRAPH,
      SLEEP_BETWEEN_BATCHES,
      BATCH_SIZE,
      {},
      endpoint,
      "INSERT",
      //If we don't bypass mu-auth already from the start, we provide a direct database endpoint
      // as fallback
      !BYPASS_MU_AUTH_FOR_EXPENSIVE_QUERIES ? DIRECT_DATABASE_ENDPOINT : '',
      PARALLEL_CALLS
    );

  }
}

module.exports = {
  dispatch
};
