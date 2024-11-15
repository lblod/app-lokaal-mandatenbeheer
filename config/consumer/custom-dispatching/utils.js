async function parallelizedBatchedUpdate (
  lib,
  nTriples,
  targetGraph,
  sleep,
  batch,
  extraHeaders,
  endpoint,
  operation,
  directDatabaseEndpoint = '',
  threads = 1
) {

  const { chunk } = lib;

  const triplesLength = nTriples.length;
  console.log(`Received ${triplesLength} triples.;
    ${threads}-parallel batches will be created`);

  const parallelBatches = chunk(nTriples,
                                Math.ceil(triplesLength / threads));

  console.log(`We have ${parallelBatches.length} parallel batches`);

  await Promise.all(
    parallelBatches.map(async parallelBatch => {
        try {
          await batchedUpdate(
            lib,
            parallelBatch,
            targetGraph,
            sleep,
            batch,
            extraHeaders,
            endpoint,
            operation,
          );
        }
        catch(e) {
          console.warn(`Error ${e} ingesting parallel batch.`);
          // This means we haven't tried directly through virtuoso yet
          if(directDatabaseEndpoint) {
            console.warn(`Ingesting through mu-auth failed.
              Attempt with a direct call to ${directDatabaseEndpoint} this time...`);
            await batchedUpdate(
              lib,
              parallelBatch,
              targetGraph,
              sleep,
              batch,
              extraHeaders,
              directDatabaseEndpoint,
              operation,
            );
          }
          else {
            console.log(`No options left for updating db; throwing error...`);
            throw e;
          }
        }
    })
  );
}

async function batchedUpdate(
  lib,
  nTriples,
  targetGraph,
  sleep,
  batch,
  extraHeaders,
  endpoint,
  operation,
) {

  const { muAuthSudo, chunk, sparqlEscapeUri } = lib;
  console.log(`Batch size: ${nTriples.length}`);

  const chunkedArray = chunk(nTriples, batch);
  let chunkCounter = 1;

  for (const chunkedTriple of chunkedArray) {
    console.log(
      `Processing chunk number ${chunkCounter} of ${chunkedArray.length} chunks.`,
    );
    console.log(`using endpoint from utils ${endpoint}`);
    try {
      const updateQuery = `
        ${operation} DATA {
           GRAPH ${sparqlEscapeUri(targetGraph)} {
             ${chunkedTriple.join("")}
           }
        }
      `;
      console.log(
        `Hitting database ${endpoint} with batched query \n ${updateQuery}`,
      );
      const connectOptions = { sparqlEndpoint: endpoint, mayRetry: true };
      console.log(
        "connectOptions: ",
        connectOptions,
        "Extra headers: ",
        extraHeaders,
      );
      await muAuthSudo.updateSudo(updateQuery, extraHeaders, connectOptions);
      console.log(`Sleeping before next query execution: ${sleep}`);
      await new Promise((r) => setTimeout(r, sleep));
    } catch (err) {
      // Binary backoff recovery.
      console.log("ERROR: ", err);
      console.log(
        `Inserting the chunk failed for chunk size ${batch} and ${nTriples.length} triples`,
      );
      const smallerBatch = Math.floor(batch / 2);
      if (smallerBatch === 0) {
        console.log("the triples that fails: ", nTriples);
        throw new Error(`Backoff mechanism stops in batched update,
          we can't work with chunks the size of ${smallerBatch}`);
      }
      console.log(`Let's try to ingest wiht chunk size of ${smallerBatch}`);
      await batchedUpdate(
        lib,
        chunkedTriple,
        targetGraph,
        sleep,
        smallerBatch,
        extraHeaders,
        endpoint,
        operation,
      );
    }
    ++chunkCounter;
  }
}

module.exports = {
  batchedUpdate,
  parallelizedBatchedUpdate,
};
