import { query, sparqlEscapeUri, sparqlEscape } from "mu";
import { LDES_ENDPOINT } from "../config";
import fetch from "node-fetch";
import { log } from "./logger";

const fetchSubjectData = async (subject: string) => {
  const data = await query(`
    CONSTRUCT {
      <${subject}> ?p ?o .
    } WHERE {
      GRAPH ?g {
        <${subject}> ?p ?o .
      }
      FILTER NOT EXISTS {
        ?g a <http://mu.semte.ch/vocabularies/ext/FormHistory> .
      }
    }
  `);
  return data.results.bindings.map(bindingToTriple).join("\n");
};

async function sendLDESRequest(type: string, body: string) {
  log(`Sending data to LDES endpoint ${LDES_ENDPOINT}/${type}`, "debug");
  await fetch(`${LDES_ENDPOINT}/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/turtle",
    },
    // xsd prefix is used in the types of the result data, so it needs to be declared.
    body: `@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n${body}`,
  });
}

const datatypeNames = {
  "http://www.w3.org/2001/XMLSchema#dateTime": "dateTime",
  "http://www.w3.org/2001/XMLSchema#date": "date",
  "http://www.w3.org/2001/XMLSchema#decimal": "decimal",
  "http://www.w3.org/2001/XMLSchema#integer": "int",
  "http://www.w3.org/2001/XMLSchema#float": "float",
  "http://www.w3.org/2001/XMLSchema#boolean": "bool",
};

const sparqlEscapeObject = (bindingObject): string => {
  const escapeType = datatypeNames[bindingObject.datatype] || "string";
  return bindingObject.type === "uri"
    ? sparqlEscapeUri(bindingObject.value)
    : sparqlEscape(bindingObject.value, escapeType);
};

const bindingToTriple = (binding) =>
  `${sparqlEscapeUri(binding.s.value)} ${sparqlEscapeUri(
    binding.p.value
  )} ${sparqlEscapeObject(binding.o)} .`;

/**
 * Publish the currently known info for the given subject URI to the LDES endpoint of the given type
 * @param ldesType the name of the LDES endpoint to publish to (e.g. "person")
 * @param subject the uri of the subject to fetch data for and publish
 */
export const publish = async (ldesType: string, subject: string) => {
  const data = await fetchSubjectData(subject);
  log(`Publishing data for subject ${subject}:\n${data}`, "debug");
  await sendLDESRequest(ldesType, data).catch((e) => {
    log(
      `Error publishing data for subject ${subject} to LDES endpoint ${ldesType}: ${e}`,
      "error"
    );
  });
};
