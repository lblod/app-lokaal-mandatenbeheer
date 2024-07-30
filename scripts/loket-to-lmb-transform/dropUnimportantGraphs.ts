import { querySudo, updateSudo } from '@lblod/mu-auth-sudo';
import { DROP_GRAPH_BATCH_SIZE, sparqlOptions } from './constants';

export async function dropUnimportantGraphs(){
  console.log('dropping unimportant graphs');

  let droppedGraphs = 1;
  while(droppedGraphs){
    droppedGraphs = await dropBatchOfUnimportantGraphs();
    console.log(`Dropped ${droppedGraphs} graphs...`);
  }
  console.log(`Dropped all unimportant graphs!`);
}

async function getUnimportantGraphs(){
  const result = await querySudo(`
    SELECT DISTINCT ?g WHERE {
      GRAPH ?g {
        ?s ?p ?o
      }
      FILTER (?g != <http://mu.semte.ch/graphs/public> && !STRENDS(STR(?g), "/LoketLB-mandaatGebruiker") && !STRENDS(STR(?g), "/LoketLB-LeidinggevendenGebruiker"))
    } LIMIT ${DROP_GRAPH_BATCH_SIZE}
  `, {}, sparqlOptions);

  return result.results.bindings.map(b => b.g.value);
}

async function dropBatchOfUnimportantGraphs(){
  const graphs = await getUnimportantGraphs();
  if(graphs.length === 0){
    return 0;
  }
  const dropStatement = `DROP SILENT GRAPH <${graphs.join('>; DROP SILENT GRAPH <')}>;`;
  await updateSudo(dropStatement, {}, sparqlOptions);
  return graphs.length;
}
