import env from "env-var";
import { readdir, readFile } from "fs/promises";
import path from "path";

import { sparqlEscapeUri, sparqlEscapeString, uuid } from "mu";
import { SparqlJsonParser } from "sparqljson-parse";

import { Parser, Store, DataFactory, Writer } from "n3";
const { namedNode, literal, quad } = DataFactory;

import { querySudo, updateSudo } from "@lblod/mu-auth-sudo";

const BATCH_SIZE =
  process.env.BATCH_SIZE != undefined
    ? env.get("BATCH_SIZE").asIntPositive()
    : 50;

export async function mergeFilesContent(directory) {
  try {
    const files = await readdir(directory);

    if (files.length === 0) {
      console.log("No files found in the directory.");
      return;
    }

    // Loop over files and read their contents
    const contentPromises = files.map(async (file) => {
      const filePath = path.join(directory, file);
      return readFile(filePath, "utf8");
    });

    // Wait for all file contents to be read
    const contents = await Promise.all(contentPromises);

    // Merge all content into a single field
    const mergedContent = contents.join("\n");
    return mergedContent;
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

export async function getBestuurseenhedenUriAndUuidsToProcess(
  bestuurseenheidClassificaties
) {
  let sparqlValuesBestuurseenheidClassificaties = ``;
  if (bestuurseenheidClassificaties && bestuurseenheidClassificaties.length) {
    sparqlValuesBestuurseenheidClassificaties = `VALUES ?bestuurseenheidClassificatie {${bestuurseenheidClassificaties
      .map((b) => `${sparqlEscapeUri(b)} `)
      .join("")}}`;
  }
  const queryStringBestuurseenheden = `
        PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
        PREFIX sh: <http://www.w3.org/ns/shacl#>
        PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

        SELECT DISTINCT (?bestuurseenheid as ?uri) ?uuid
        WHERE {
            ?bestuurseenheid a besluit:Bestuurseenheid ;
                            mu:uuid ?uuid ;
                            besluit:classificatie ?bestuurseenheidClassificatie .

            {
              SELECT ?bestuurseenheid (MAX(?safeCreated) AS ?latestCreated) WHERE {
                GRAPH ?g {
                  ?org besluit:bestuurt ?bestuurseenheid .
                  OPTIONAL {
                    ?report a sh:ValidationReport ;
                            dct:created ?created .
                  }

                  BIND(COALESCE(?created, "2000-01-01T00:00:00"^^xsd:dateTime) as ?safeCreated)
                }
                ?g ext:ownedBy ?bestuurseenheid.
              } GROUP BY ?bestuurseenheid
            }

            ${sparqlValuesBestuurseenheidClassificaties}
        } ORDER BY ASC(?latestCreated) LIMIT ${BATCH_SIZE}
    `;
  const queryResponse = await querySudo(queryStringBestuurseenheden);
  const uriAndUuids = queryResponse.results.bindings.map((res) => {
    return { uri: res.uri.value, uuid: res.uuid.value };
  });

  return uriAndUuids;
}

export async function getBestuurseenheidUriAndUuid(bestuurseenheid) {
  const queryStringBestuurseenheid = `
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    SELECT DISTINCT ?uuid
    WHERE {
        ${sparqlEscapeUri(bestuurseenheid)} a besluit:Bestuurseenheid ;
                        mu:uuid ?uuid .
    }
  `;
  const queryResponse = await querySudo(queryStringBestuurseenheid);

  if (queryResponse.results.bindings.length === 0) return;

  return {
    uri: bestuurseenheid,
    uuid: queryResponse.results.bindings[0].uuid.value,
  };
}

export function generateNamedGraphFromUuid(uuid) {
  return `http://mu.semte.ch/graphs/organizations/${uuid}/LoketLB-mandaatGebruiker`;
}

export async function getNamedGraphsForBestuurseenheidId(uuid) {
  const sparqlQuery = `
        PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

        SELECT ?graph WHERE {
          ?graph ext:ownedBy ?someone.
          VALUES ?uuid {
            ${sparqlEscapeString(uuid)}
          }
          { { ?someone mu:uuid ?uuid. }
            UNION
            { ?someone ext:isOCMWVoor / mu:uuid ?uuid. }
            UNION
            { ?someone ^ext:isOCMWVoor / mu:uuid ?uuid. }
          }
        }
    `;
  const queryResponse = await querySudo(sparqlQuery);
  return queryResponse.results.bindings.map((res) => res.graph.value);
}

export async function getSelfAndOCMW(uuid) {
  const sparqlQuery = `
        PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

        SELECT DISTINCT ?eenheid WHERE {
          VALUES ?uuid {
            ${sparqlEscapeString(uuid)}
          }
          { { ?eenheid mu:uuid ?uuid. }
            UNION
            { ?eenheid ext:isOCMWVoor / mu:uuid ?uuid. }
            UNION
            { ?eenheid ^ext:isOCMWVoor / mu:uuid ?uuid. }
          }
        }
    `;
  const queryResponse = await querySudo(sparqlQuery);
  return queryResponse.results.bindings.map((res) => res.eenheid.value);
}

export async function executeConstructQueriesOnNamedGraph(
  uriAndUuid,
  targetBestuursperiode
) {
  const bestuurseenheidUris = await getSelfAndOCMW(uriAndUuid.uuid);
  const namedGraphs = await getNamedGraphsForBestuurseenheidId(uriAndUuid.uuid);
  const store = new Store();
  const bestuursorganen = await addBestuursorgaanAndMandatarissen(
    store,
    bestuurseenheidUris,
    namedGraphs,
    targetBestuursperiode
  );
  await addPersonen(store, namedGraphs, bestuursorganen);
  await addFracties(store, namedGraphs, bestuursorganen);
  await addMandaten(store, bestuursorganen);
  await addLidmaatschappen(store, namedGraphs, bestuursorganen);
  await addPublicData(store);

  return store;
}

async function addBestuursorgaanAndMandatarissen(
  store,
  bestuurseenheidUris,
  targetGraphs,
  bestuursperiodeUri
) {
  const safeBestuurseenheden = bestuurseenheidUris
    .map((uri) => sparqlEscapeUri(uri))
    .join("\n");
  const safeTargetGraphs = targetGraphs
    .map((uri) => sparqlEscapeUri(uri))
    .join("\n");
  const queryStringConstructOfGraph = `
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    CONSTRUCT {
        ?bestuursorgaanInTijd  ?pBestuursorgaanInTijd ?oBestuursorgaanInTijd .
        ?bestuursorgaan ?pBestuursorgaan ?oBestuursorgaan .
        ?eenheid besluit:classificatie ?oBestuurseenheid .
        ?mandataris ?pMandataris ?oMandataris .
    }
    WHERE {
        VALUES ?bestuursperiode {
         ${sparqlEscapeUri(bestuursperiodeUri)}
        } .
        VALUES ?eenheid {
          ${safeBestuurseenheden}
        }
        VALUES ?graph {
          ${safeTargetGraphs}
        }
        GRAPH <http://mu.semte.ch/graphs/public> {
          ?eenheid besluit:classificatie ?oBestuurseenheid .
          ?bestuursorgaan besluit:bestuurt ?eenheid.
          ?bestuursorgaan ?pBestuursorgaan ?oBestuursorgaan .

          ?bestuursorgaanInTijd a besluit:Bestuursorgaan ;
            mandaat:isTijdspecialisatieVan ?bestuursorgaan ;
            org:hasPost ?mandaat ;
            ?pBestuursorgaanInTijd ?oBestuursorgaanInTijd .
        }
        ?bestuursorgaanInTijd <http://lblod.data.gift/vocabularies/lmb/heeftBestuursperiode> ?bestuursperiode .

        GRAPH ?graph {
          OPTIONAL {
              ?mandataris org:holds ?mandaat ;
                          ?pMandataris ?oMandataris .
          }
        }
    }
    `;

  const queryResponse = await querySudo(queryStringConstructOfGraph);
  const bestuursorganen = queryResponse.results.bindings
    .filter((res) => {
      return (
        res.p.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" &&
        res.o.value === "http://data.vlaanderen.be/ns/besluit#Bestuursorgaan"
      );
    })
    .map((res) => {
      return res.s.value;
    });
  await addConstructQueryResponseToStore(store, queryResponse);
  return bestuursorganen;
}

async function addPersonen(store, namedGraphs, bestuursorgaanUris) {
  const safeNamedGraphs = namedGraphs
    .map((uri) => sparqlEscapeUri(uri))
    .join("\n");
  const safeBestuursorganen = bestuursorgaanUris
    .map((uri) => sparqlEscapeUri(uri))
    .join("\n");
  const queryStringConstructOfGraph = `
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
    PREFIX adms: <http://www.w3.org/ns/adms#>

    CONSTRUCT {
        ?persoon ?pPersoon ?oPersoon .
        ?geboorte ?pGeboorte ?oGeboorte .
        ?identifier ?pIdentifier ?oIdentifier .
    }
    WHERE {
        VALUES ?graph {
            ${safeNamedGraphs}
        }
        VALUES ?bestuursorgaanInTijd {
            ${safeBestuursorganen}
        }
        ?bestuursorgaanInTijd org:hasPost ?mandaat .

        GRAPH ?graph {
            ?mandaat ^org:holds / mandaat:isBestuurlijkeAliasVan ?persoon.
            ?persoon ?pPersoon ?oPersoon .
            OPTIONAL {
                ?persoon persoon:geboorte ?geboorte .
                ?geboorte ?pGeboorte ?oGeboorte .
            }
            OPTIONAL {
                ?persoon adms:identifier ?identifier .
                ?identifier ?pIdentifier ?oIdentifier .
            }
        }
    }`;

  const queryResponse = await querySudo(queryStringConstructOfGraph);
  await addConstructQueryResponseToStore(store, queryResponse);
}

async function addFracties(store, namedGraphs, bestuursorgaanUris) {
  const safeNamedGraphs = namedGraphs
    .map((uri) => sparqlEscapeUri(uri))
    .join("\n");
  const safeBestuursorganen = bestuursorgaanUris
    .map((uri) => sparqlEscapeUri(uri))
    .join("\n");
  const queryStringConstructOfGraph = `
    PREFIX org: <http://www.w3.org/ns/org#>

    CONSTRUCT {
        ?fractie ?p ?o .
    }
    WHERE {
        VALUES ?graph {
            ${safeNamedGraphs}
        }
        GRAPH ?graph {
            VALUES ?bestuursorgaanInTijd {
                ${safeBestuursorganen}
            }
            ?bestuursorgaanInTijd ^org:memberOf ?fractie .
            ?fractie ?p ?o .
        }
    }`;

  const queryResponse = await querySudo(queryStringConstructOfGraph);
  await addConstructQueryResponseToStore(store, queryResponse);
}

async function addMandaten(store, bestuursorgaanUris) {
  const safeBestuursorganen = bestuursorgaanUris
    .map((uri) => sparqlEscapeUri(uri))
    .join("\n");
  const queryStringConstructOfGraph = `
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    CONSTRUCT {
        ?mandaat ?p ?o .
        ?bestuursorgaanInTijd org:hasPost ?mandaat .
    }
    WHERE {
        GRAPH <http://mu.semte.ch/graphs/public> {
            VALUES ?bestuursorgaanInTijd {
                ${safeBestuursorganen}
            }
            ?bestuursorgaanInTijd org:hasPost ?mandaat .
        }
        GRAPH ?g {
          ?mandaat ?p ?o .
        }
        ?g ext:ownedBy ?someone.
    }`;

  const queryResponse = await querySudo(queryStringConstructOfGraph);

  await addConstructQueryResponseToStore(store, queryResponse);
}

async function addLidmaatschappen(store, namedGraphs, bestuursorgaanUris) {
  const safeNamedGraphs = namedGraphs
    .map((uri) => sparqlEscapeUri(uri))
    .join("\n");

  const safeBestuursorganen = bestuursorgaanUris
    .map((uri) => sparqlEscapeUri(uri))
    .join("\n");
  const queryStringConstructOfGraph = `
    PREFIX org: <http://www.w3.org/ns/org#>

    CONSTRUCT {
        ?lidmaatschap ?p ?o .
    }
    WHERE {
        GRAPH <http://mu.semte.ch/graphs/public> {
          VALUES ?bestuursorgaanInTijd {
              ${safeBestuursorganen}
          }
          ?bestuursorgaanInTijd org:hasPost ?mandaat.
        }
        GRAPH ?graph {
            VALUES ?safeNamedGraphs {
                ${safeNamedGraphs}
            }
            ?mandaat ^org:holds / org:hasMembership ?lidmaatschap .
            ?lidmaatschap ?p ?o .
        }
    }`;

  const queryResponse = await querySudo(queryStringConstructOfGraph);
  await addConstructQueryResponseToStore(store, queryResponse);
}

async function addPublicData(store) {
  const queryStringConstructOfGraph = `
    PREFIX org: <http://www.w3.org/ns/org#>

    CONSTRUCT {
        ?s ?p ?o.
    }
    WHERE {
        GRAPH <http://mu.semte.ch/graphs/public> {
            VALUES ?conceptschemes {
              <http://data.lblod.info/id/conceptscheme/LocalPoliticianMandateRole>
              <http://data.vlaanderen.be/id/conceptscheme/BestuursfunctieCode>
              <http://data.lblod.info/id/conceptscheme/LokaalMandaatClassificatieCode>
            }
            ?s skos:inScheme ?conceptschemes .
            ?s ?p ?o.
        }
    }`;

  const queryResponse = await querySudo(queryStringConstructOfGraph);
  await addConstructQueryResponseToStore(store, queryResponse);
}

function addConstructQueryResponseToStore(store, queryResponse) {
  console.log(
    `Adding ${queryResponse.results.bindings.length} triples to the store`
  );
  const sparqlJsonParser = new SparqlJsonParser();
  const rdfJsObjects = sparqlJsonParser.parseJsonResults(queryResponse);

  rdfJsObjects.forEach((quad) => {
    store.addQuad(
      quad.s,
      quad.p,
      quad.o,
      quad.g || undefined // Optional: Include a graph if your RDFJS object contains it
    );
  });

  return store;
}

export async function parseTurtleString(turtleString) {
  const parser = new Parser();
  const store = new Store();

  // Parse the Turtle string into quads
  const quads = parser.parse(turtleString);

  // Add all parsed quads to the store
  store.addQuads(quads);

  return store;
}

// Function to validate a dataset using a SHACL shape
export async function validateDataset(dataset, shapesDataset) {
  // Import ESM modules dynamically
  const rdf = await eval('import("rdf-ext")');
  const shacl = await eval('import("shacl-engine")');
  const sparqljs = await eval('import("shacl-engine/sparql.js")');

  const validator = new shacl.Validator(shapesDataset, {
    factory: rdf.default,
    validations: sparqljs.validations,
  });
  const report = await validator.validate({ dataset: dataset });

  return report;
}

export function enrichValidationReport(
  reportDataset,
  shapesDataset,
  dataDataset
) {
  const validationResults = reportDataset.match(
    null,
    namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    namedNode("http://www.w3.org/ns/shacl#ValidationResult")
  );
  for (const validationResultQuad of validationResults) {
    // Retrieve targetClass of ValidationResult using the targetClass of the shape or type of instance
    const sourceShapeQuads = reportDataset.match(
      validationResultQuad.subject,
      namedNode("http://www.w3.org/ns/shacl#sourceShape"),
      null
    );
    if (!sourceShapeQuads.size)
      throw new Error("No source shape found on validation result");
    const [sourceShapeQuad] = sourceShapeQuads;
    const targetClassInShapeQuads = shapesDataset.match(
      sourceShapeQuad.object,
      namedNode("http://www.w3.org/ns/shacl#targetClass"),
      null
    );
    let targetClassQuad;
    let targetIdQuad;
    const focusNodeQuads = reportDataset.match(
      validationResultQuad.subject,
      namedNode("http://www.w3.org/ns/shacl#focusNode"),
      null
    );
    if (!targetClassInShapeQuads.size) {
      // Fallback by searching the class of the focus node in the dataset
      if (!focusNodeQuads.size) {
        throw new Error(
          "No focus node found in validation result as fallback to retrieve targetClass"
        );
      }
      const [focusNodeQuad] = focusNodeQuads;

      const focusNodeTypeInDatasetQuads = dataDataset.match(
        focusNodeQuad.object,
        namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        null
      );
      if (!focusNodeTypeInDatasetQuads.size) {
        throw new Error(
          "No type of focus node found in validation result as fallback to retrieve targetClass"
        );
      }
      [targetClassQuad] = focusNodeTypeInDatasetQuads;
    } else {
      [targetClassQuad] = targetClassInShapeQuads;
    }

    // Do not include triples of validation result when ClassConstraintComponent
    const isClassConstraintComponent =
      reportDataset.match(
        validationResultQuad.subject,
        namedNode("http://www.w3.org/ns/shacl#sourceConstraintComponent"),
        namedNode("http://www.w3.org/ns/shacl#ClassConstraintComponent")
      ).size > 0;

    // Replace blank node of ValidationResult with UUID-based URI
    const validationResultUUID = uuid();
    const validationResultURI = `http://data.lblod.info/id/validationresults/${validationResultUUID}`;

    if (focusNodeQuads.size) {
      const [focusNodeQuad] = focusNodeQuads;
      [targetIdQuad] = dataDataset.match(
        focusNodeQuad.object,
        namedNode("http://mu.semte.ch/vocabularies/core/uuid"),
        null
      );
      if (targetIdQuad) {
        reportDataset.add(
          quad(
            validationResultQuad.subject,
            namedNode(
              "http://lblod.data.gift/vocabularies/lmb/targetIdOfFocusNode"
            ),
            targetIdQuad.object
          )
        );
      }
    }

    // Add targetClass to validation result
    if (!isClassConstraintComponent)
      reportDataset.add(
        quad(
          validationResultQuad.subject,
          namedNode(
            "http://lblod.data.gift/vocabularies/lmb/targetClassOfFocusNode"
          ),
          namedNode(targetClassQuad.object.value)
        )
      );
    // Add UUID
    if (!isClassConstraintComponent)
      reportDataset.add(
        quad(
          validationResultQuad.subject,
          namedNode("http://mu.semte.ch/vocabularies/core/uuid"),
          literal(validationResultUUID)
        )
      );

    const triplesOfValidationResult = reportDataset.match(
      validationResultQuad.subject,
      null,
      null
    );
    for (const resultQuad of triplesOfValidationResult) {
      if (resultQuad.object.termType != "BlankNode") {
        if (!isClassConstraintComponent)
          reportDataset.add(
            quad(
              namedNode(validationResultURI),
              resultQuad.predicate,
              resultQuad.object
            )
          );
      }
      // Remove blank node
      reportDataset.delete(
        quad(
          validationResultQuad.subject,
          resultQuad.predicate,
          resultQuad.object
        )
      );
    }

    const triplesPointingToValidationResult = reportDataset.match(
      null,
      null,
      validationResultQuad.subject
    );
    for (const resultQuad of triplesPointingToValidationResult) {
      if (!isClassConstraintComponent)
        reportDataset.add(
          quad(
            resultQuad.subject,
            resultQuad.predicate,
            namedNode(validationResultURI)
          )
        );
      // Remove blank node
      reportDataset.delete(
        quad(
          resultQuad.subject,
          resultQuad.predicate,
          validationResultQuad.subject
        )
      );
    }
  }

  // Replace blank node of ValidationReport with UUID-based URI
  const validationReports = reportDataset.match(
    null,
    namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    namedNode("http://www.w3.org/ns/shacl#ValidationReport")
  );
  let reportUri = null;
  for (const validationReportQuad of validationReports) {
    const reportUUID = uuid();
    const reportURI = `http://data.lblod.info/id/reports/${reportUUID}`;
    reportUri = reportURI;
    const reportCreatedAt = new Date().toISOString();
    const triplesOfValidationReport = reportDataset.match(
      validationReportQuad.subject,
      null,
      null
    );
    for (const resultQuad of triplesOfValidationReport) {
      reportDataset.add(
        quad(namedNode(reportURI), resultQuad.predicate, resultQuad.object)
      );
      // Add UUID
      reportDataset.add(
        quad(
          namedNode(reportURI),
          namedNode("http://mu.semte.ch/vocabularies/core/uuid"),
          literal(reportUUID)
        )
      );
      // Add creation time stamp
      reportDataset.add(
        quad(
          namedNode(reportURI),
          namedNode("http://purl.org/dc/terms/created"),
          literal(
            reportCreatedAt,
            namedNode("http://www.w3.org/2001/XMLSchema#dateTime")
          )
        )
      );

      // Remove blank node
      reportDataset.delete(
        quad(
          validationReportQuad.subject,
          resultQuad.predicate,
          resultQuad.object
        )
      );
    }
  }
  return { reportUri, reportDataset };
}

export async function saveDatasetToNamedGraphs(dataset, namedGraphs) {
  const writer = new Writer({ format: "N-Triples" });
  for (const quad of dataset) {
    writer.addQuad(quad);
  }

  const triples = await new Promise((resolve, reject) => {
    writer.end((error, result) => {
      if (error) {
        console.log("Error while writing to store");
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  const queryString = `
        PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

        INSERT {
            GRAPH ?g {
                ${triples}
            }
        } WHERE {
          VALUES ?g {
            ${namedGraphs.map((g) => sparqlEscapeUri(g)).join("\n")}
          }
          ?g ext:ownedBy ?someone .
        }
        `;
  await updateSudo(queryString);
}

export async function deletePreviousReports(namedGraphs) {
  const queryString = `
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX sh: <http://www.w3.org/ns/shacl#>

    SELECT DISTINCT ?reportUri
    WHERE {
        VALUES ?g {
          ${namedGraphs.map((g) => sparqlEscapeUri(g)).join("\n")}
        }
        GRAPH ?g {
            ?reportUri a sh:ValidationReport ;
                dct:created ?created .
        }
    }
    ORDER BY DESC(?created)
  `;

  const response = await querySudo(queryString);

  if (response.results.bindings.length) {
    response.results.bindings.shift(); // don't remove latest report
    for (const binding of response.results.bindings) {
      await deleteReportInDatabase(binding.reportUri.value, namedGraphs);
    }
    console.log("All reports deleted");
  }
}

async function deleteReportInDatabase(reportUri, namedGraphs) {
  const queryString = `
        PREFIX sh: <http://www.w3.org/ns/shacl#>

        DELETE {
          GRAPH ?g {
            ${sparqlEscapeUri(reportUri)} sh:result ?result ;
            ?preport ?oreport .

            ?result ?presult ?oresult .
          }
        }
        WHERE {
          VALUES ?g {
            ${namedGraphs.map((g) => sparqlEscapeUri(g)).join("\n")}
          }
          GRAPH ?g {
            ${sparqlEscapeUri(reportUri)} sh:result ?result ;
            ?preport ?oreport .

            ?result ?presult ?oresult .
          }
        }
    `;
  await querySudo(queryString);
}
