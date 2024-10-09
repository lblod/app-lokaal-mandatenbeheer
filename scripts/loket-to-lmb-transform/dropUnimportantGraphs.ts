import { querySudo, updateSudo } from "@lblod/mu-auth-sudo";
import { DROP_GRAPH_BATCH_SIZE, sparqlOptions } from "./constants";

export async function dropUnimportantGraphs() {
  console.log("keeping email addresses from loket");
  await saveEmailInfo();
  console.log("dropping unimportant graphs");

  let droppedGraphs = 1;
  while (droppedGraphs) {
    droppedGraphs = await dropBatchOfUnimportantGraphs();
    console.log(`Dropped ${droppedGraphs} graphs...`);
  }
  console.log(`Dropped all unimportant graphs!`);
}

async function saveEmailInfo() {
  // these emails are in berichtgebruiker graphs which will be purged
  await updateSudo(
    `
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    INSERT {
      GRAPH <http://mu.semte.ch/graphs/public> {
        ?s ext:mailAdresVoorNotificaties ?email.
      }
    } WHERE {
        ?s ext:mailAdresVoorNotificaties ?email.
    }`,
    {},
    sparqlOptions
  );
}

async function getUnimportantGraphs() {
  const result = await querySudo(
    `
    SELECT DISTINCT ?g WHERE {
      GRAPH ?g {
        ?s ?p ?o
      }
      FILTER (?g != <http://mu.semte.ch/graphs/public> && !STRENDS(STR(?g), "/LoketLB-mandaatGebruiker"))
    } LIMIT ${DROP_GRAPH_BATCH_SIZE}
  `,
    {},
    sparqlOptions
  );

  return result.results.bindings.map((b) => b.g.value);
}

async function dropBatchOfUnimportantGraphs() {
  const graphs = await getUnimportantGraphs();
  if (graphs.length === 0) {
    return 0;
  }
  const dropStatement = `DROP SILENT GRAPH <${graphs.join(
    ">; DROP SILENT GRAPH <"
  )}>;`;
  await updateSudo(dropStatement, {}, sparqlOptions);
  return graphs.length;
}
