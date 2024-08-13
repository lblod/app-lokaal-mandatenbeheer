import fs from "fs";
import { querySudo } from "@lblod/mu-auth-sudo";
import { sparqlOptions } from "./constants";
import { sparqlEscape} from 'mu';

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "10000");
const FILE_SIZE = parseInt(process.env.FILE_SIZE || "1000000");

let stream;
let lineCount = 0;
let fileCount = 0;

function writeToStream(line){
  if(!stream || lineCount >= FILE_SIZE){
    if(stream){
      stream.end();
    }
    fileCount++;
    lineCount = 0;
    stream = fs.createWriteStream(`/data/important-graphs${fileCount}.nq`, {
      flags: "a",
    });
  }
  stream.write(line);
  lineCount++;
}

async function selectImportantGraphs() {
  const result = await querySudo(
    `
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
      SELECT DISTINCT ?g WHERE {
        GRAPH ?g {
          ?s a mandaat:Mandataris.
        }
        FILTER (?g = <http://mu.semte.ch/graphs/public> || STRENDS(STR(?g), "/LoketLB-mandaatGebruiker"))
      }
    `,
    {},
    sparqlOptions
  );

  return result.results.bindings.map((b) => b.g.value);
}

async function getGraphSize(graph){
  const result = await querySudo(
    `
      SELECT (COUNT(*) as ?count) WHERE {
        GRAPH <${graph}> {
          ?s ?p ?o
          FILTER NOT EXISTS {
              ?s a ?thing.
              VALUES ?thing {
                  <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject>
                  <http://redpencil.data.gift/vocabularies/tasks/Task>
                  <http://oscaf.sourceforge.net/ndo.html#DownloadEvent>
                  <http://docs.oasis-open.org/cti/ns/stix#MalwareAnalysis>
                }
          }
        }
      }
    `,
    {},
    sparqlOptions
  );

  return parseInt(result.results.bindings[0].count.value);
}

async function writeGraph(graph){
  let offset = 0;
  const graphSize = await getGraphSize(graph);

  while(offset < graphSize){
    const result = await querySudo(
      `SELECT ?s ?p ?o WHERE {
          GRAPH <${graph}> {
            ?s ?p ?o.
            FILTER NOT EXISTS {
              ?s a ?thing.
            VALUES ?thing {
                <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject>
                <http://redpencil.data.gift/vocabularies/tasks/Task>
                <http://oscaf.sourceforge.net/ndo.html#DownloadEvent>
                <http://docs.oasis-open.org/cti/ns/stix#MalwareAnalysis>
              }
            }
          }
        } ORDER BY ?s ?p ?o LIMIT ${BATCH_SIZE} OFFSET ${offset}
      `,
      {},
      sparqlOptions
    );

    for(const binding of result.results.bindings){
      const isUri = binding.o.type === 'uri';
      let datatype = isUri ? 'uri' : binding.o.datatype;
      if (datatype === "http://www.w3.org/2001/XMLSchema#string") {
        datatype = "string";
      } else if (datatype === "http://www.w3.org/2001/XMLSchema#dateTime") {
        datatype = "dateTime";
      } else if (datatype === "http://www.w3.org/2001/XMLSchema#boolean") {
        datatype = "bool";
      } else if (
        datatype === "http://mu.semte.ch/vocabularies/typed-literals/boolean"
      ) {
        datatype = "bool";
      } else if (datatype === "http://www.w3.org/2001/XMLSchema#integer") {
        datatype = "int";
      } else if (datatype === "http://www.w3.org/2001/XMLSchema#decimal") {
        datatype = "decimal";
      } else if (datatype === "http://www.w3.org/2001/XMLSchema#float") {
        datatype = "float";
      } else if (datatype === "http://www.w3.org/2001/XMLSchema#date") {
        datatype = "date";
      } else if (datatype === undefined) {
        datatype = "string";
      }
      writeToStream(`<${binding.s.value}> <${binding.p.value}> ${sparqlEscape(binding.o.value, datatype)} <${graph}> .\n`);
    }

    if(graphSize > 3 * BATCH_SIZE){
      console.log(`<${graph}> is large. Processed ${offset} of ${graphSize} triples, ${(offset/graphSize * 100).toFixed(2)}%`);
    }
    offset += BATCH_SIZE;
  }
}



export async function writeImportantGraphs(){
  console.log(`writing important data to important-graphs.nq`);

  const importantGraphs = ['http://mu.semte.ch/graphs/public', ...await selectImportantGraphs()];
  const reportSize = 10;
  const importantGraphCount = importantGraphs.length;
  let count = 0;
  while(importantGraphs.length > 0){
    const graph = importantGraphs.pop();
    await writeGraph(graph);
    count++;
    if(count % reportSize === 0){
      console.log(`Processed ${count} of ${importantGraphCount} graphs, ${(count/importantGraphCount * 100).toFixed(2)}%`);
    }
  }
  console.log(`done writing important data to important-graphs.nq`);
  stream.end();
  console.log('stream closed');
}


