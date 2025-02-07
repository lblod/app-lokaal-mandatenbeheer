import { readdir, readFile } from 'fs/promises';
import path from 'path';

import { query, update, sparqlEscapeUri, sparqlEscapeString, uuid } from 'mu';
import {SparqlJsonParser} from "sparqljson-parse";

import { Parser, Store, DataFactory } from 'n3';
const { namedNode, literal, quad } = DataFactory;

import { batchedQuery } from '../helpers.js';

export async function mergeFilesContent(directory) {
    try {
        const files = await readdir(directory);
    
        if (files.length === 0) {
            console.log('No files found in the directory.');
            return;
        }
    
        // Loop over files and read their contents
        const contentPromises = files.map(async (file) => {
            const filePath = path.join(directory, file);
            return readFile(filePath, 'utf8');
        });
    
        // Wait for all file contents to be read
        const contents = await Promise.all(contentPromises);
    
        // Merge all content into a single field
        const mergedContent = contents.join('\n');
        return mergedContent;
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
  }
    
export async function getBestuurseenhedenUriAndUuid(bestuurseenheidClassificaties) {
    let sparqlValuesBestuurseenheidClassificaties =  ``;
    if (bestuurseenheidClassificaties && bestuurseenheidClassificaties.length) {
        sparqlValuesBestuurseenheidClassificaties =  `VALUES ?bestuurseenheidClassificatie {${bestuurseenheidClassificaties.map((b) => `${sparqlEscapeUri(b)} `).join('')}}`;
    }
    const queryStringBestuurseenheden = `
        PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX proces: <https://data.vlaanderen.be/ns/proces#>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX adms: <http://www.w3.org/ns/adms#>
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

        SELECT DISTINCT (?bestuurseenheid as ?uri) ?uuid
        WHERE {
            ?bestuurseenheid a besluit:Bestuurseenheid ;
                            mu:uuid ?uuid ;
                            besluit:classificatie ?bestuurseenheidClassificatie .
        
            ${sparqlValuesBestuurseenheidClassificaties}
        }
    `;
    const queryResponse = await batchedQuery(queryStringBestuurseenheden);
    const uriAndUuids = queryResponse.results.bindings.map((res) => { return {'uri': res.uri.value, 'uuid': res.uuid.value } });

    return uriAndUuids;
}

export function generateNamedGraphFromUuid(uuid) {
    return `http://mu.semte.ch/graphs/organizations/${uuid}/LoketLB-mandaatGebruiker`;
}

export async function executeConstructQueryOnNamedGraph(uriAndUuid, bestuursperiodeLabel) {
    const namedGraph = generateNamedGraphFromUuid(uriAndUuid.uuid);

    const queryStringConstructOfGraph = `
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX org: <http://www.w3.org/ns/org#>

    CONSTRUCT {
        ?bestuursorgaanInTijd  ?pBestuursorgaanInTijd ?oBestuursorgaanInTijd .
                                ?bestuursorgaan ?pBestuursorgaan ?oBestuursorgaan .
        ${sparqlEscapeUri(uriAndUuid.uri)} besluit:classificatie ?oBestuurseenheid .
        ?mandataris ?pMandataris ?oMandataris .
        ?persoon ?pPersoon ?oPersoon .
    }
    WHERE {
        ?bestuursperiode skos:prefLabel ${sparqlEscapeString(bestuursperiodeLabel)} .
        GRAPH ${sparqlEscapeUri(namedGraph)} {    
            ?bestuursorgaanInTijd a besluit:Bestuursorgaan ;
                <http://lblod.data.gift/vocabularies/lmb/heeftBestuursperiode> ?bestuursperiode ;
                mandaat:isTijdspecialisatieVan ?bestuursorgaan ;
                org:hasPost ?mandaat ;
                ?pBestuursorgaanInTijd ?oBestuursorgaanInTijd .
            
            ?bestuursorgaan ?pBestuursorgaan ?oBestuursorgaan .

            OPTIONAL {
                ?mandataris org:holds ?mandaat ;
                            mandaat:isBestuurlijkeAliasVan ?persoon ;
                            ?pMandataris ?oMandataris .

                ?persoon ?pPersoon ?oPersoon .
           }
            
        }
        ${sparqlEscapeUri(uriAndUuid.uri)} besluit:classificatie ?oBestuurseenheid .
    }
    `;

    const queryResponse = await query(queryStringConstructOfGraph);
    return convertConstructQueryResponseToStore(queryResponse);
}

export function convertConstructQueryResponseToStore(queryResponse) {
    const sparqlJsonParser = new SparqlJsonParser();
    const rdfJsObjects = sparqlJsonParser.parseJsonResults(queryResponse);

    const store = new Store();

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
    const rdf = await (eval('import("rdf-ext")'));
    const shacl = await (eval('import("shacl-engine")'));
    const sparqljs = await (eval('import("shacl-engine/sparql.js")'));
    
    const validator = new shacl.Validator(shapesDataset, {
        factory: rdf.default ,
        validations: sparqljs.validations
    });
    const report = await validator.validate({ dataset: dataset });

    return report;
}

export function enrichValidationReport(reportDataset, shapesDataset, dataDataset) {
    const validationResults = reportDataset.match(null, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/ns/shacl#ValidationResult'));
    for (const validationResultQuad of validationResults) {
        // Retrieve targetClass of ValidationResult using the targetClass of the shape or type of instance
        const sourceShapeQuads = reportDataset.match(validationResultQuad.subject, namedNode('http://www.w3.org/ns/shacl#sourceShape'), null);
        if(!sourceShapeQuads.size) throw "No source shape found on validation result";
        const [sourceShapeQuad] = sourceShapeQuads;
        const targetClassInShapeQuads = shapesDataset.match(sourceShapeQuad.object, namedNode('http://www.w3.org/ns/shacl#targetClass'), null);
        let targetClassQuad;
        if(!targetClassInShapeQuads.size) {
            // Fallback by searching the class of the focus node in the dataset
            const focusNodeQuads = reportDataset.match(validationResultQuad.subject, namedNode('http://www.w3.org/ns/shacl#focusNode'), null);
            if(!focusNodeQuads.size) throw "No focus node found in validation result as fallback to retrieve targetClass";
            const [focusNodeQuad] = focusNodeQuads;

            const focusNodeTypeInDatasetQuads = dataDataset.match(focusNodeQuad.object, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), null);
            if(!focusNodeTypeInDatasetQuads.size) throw "No type of focus node found in validation result as fallback to retrieve targetClass";
            [targetClassQuad] = focusNodeTypeInDatasetQuads;
        } else {
            [targetClassQuad] = targetClassInShapeQuads;
        }

        // Do not include triples of validation result when ClassConstraintComponent
        const isClassConstraintComponent = (reportDataset.match(validationResultQuad.subject, namedNode('http://www.w3.org/ns/shacl#sourceConstraintComponent'), namedNode('http://www.w3.org/ns/shacl#ClassConstraintComponent'))).size > 0;

        // Replace blank node of ValidationResult with UUID-based URI
        const validationResultUUID = uuid();
        const validationResultURI = `http://data.lblod.info/id/validationresults/${validationResultUUID}`;

        // Add targetClass to validation result
        if (!isClassConstraintComponent) reportDataset.add(quad(
            validationResultQuad.subject,
            namedNode('http://lblod.data.gift/vocabularies/lmb/targetClassOfFocusNode'),
            namedNode(targetClassQuad.object.value)
        ));
        // Add UUID
        if (!isClassConstraintComponent) reportDataset.add(quad(
            validationResultQuad.subject,
            namedNode('http://mu.semte.ch/vocabularies/core/uuid'), 
            literal(validationResultUUID)
        ));
        
        const triplesOfValidationResult = reportDataset.match(validationResultQuad.subject, null, null);
        for (const resultQuad of triplesOfValidationResult) {
            if (resultQuad.object.termType != 'BlankNode') {
                if (!isClassConstraintComponent) reportDataset.add(quad(
                    namedNode(validationResultURI),
                    resultQuad.predicate, 
                    resultQuad.object
                ));
            }
            // Remove blank node
            reportDataset.delete(quad(
                validationResultQuad.subject,
                resultQuad.predicate, 
                resultQuad.object
            ));  
        }

        const triplesPointingToValidationResult = reportDataset.match(null, null, validationResultQuad.subject);
        for (const resultQuad of triplesPointingToValidationResult) {
            if (!isClassConstraintComponent) reportDataset.add(quad(
                resultQuad.subject,
                resultQuad.predicate, 
                namedNode(validationResultURI)
            ));
            // Remove blank node
            reportDataset.delete(quad(
                resultQuad.subject,
                resultQuad.predicate, 
                validationResultQuad.subject
            ));  
        }
    }

    // Replace blank node of ValidationReport with UUID-based URI
    const validationReports = reportDataset.match(null, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/ns/shacl#ValidationReport'));
    for (const validationReportQuad of validationReports) {
        const reportUUID = uuid();
        const reportURI = `http://data.lblod.info/id/reports/${reportUUID}`;

        const triplesOfValidationReport = reportDataset.match(validationReportQuad.subject, null, null);
        for (const resultQuad of triplesOfValidationReport) {
            reportDataset.add(quad(
                namedNode(reportURI),
                resultQuad.predicate, 
                resultQuad.object
            ));
            // Add UUID
            reportDataset.add(quad(
                namedNode(reportURI),
                namedNode('http://mu.semte.ch/vocabularies/core/uuid'), 
                literal(reportUUID)
            ));
            // Add creation time stamp
            reportDataset.add(quad(
                namedNode(reportURI),
                namedNode('http://purl.org/dc/terms/created'), 
                literal(new Date().toISOString(),namedNode('http://www.w3.org/2001/XMLSchema#dateTime'))
            ));
            
            // Remove blank node
            reportDataset.delete(quad(
                validationReportQuad.subject,
                resultQuad.predicate, 
                resultQuad.object
            ));  
        }
    }

    return reportDataset;
}


export async function saveDatasetToNamedGraph(dataset, namedGraph) {
    for (const quad of dataset) {
        const filteredDataset = dataset.match(quad.subject, quad.predicate, quad.object);
        const queryString = `
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX prov: <http://www.w3.org/ns/prov#>
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

        INSERT DATA {
            GRAPH ${sparqlEscapeUri(namedGraph)} {
                ${filteredDataset.toString()}
            }
        }
        `;
        await update(queryString);
    }
}

export async function deletePreviousReports(namedGraph) {
    const queryString = `
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX prov: <http://www.w3.org/ns/prov#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX sh: <http://www.w3.org/ns/shacl#>

    SELECT ?reportUri  
    WHERE {
        GRAPH ${sparqlEscapeUri(namedGraph)} {
            ?reportUri a sh:ValidationReport ;
                dct:created ?created .
        }
    }
    ORDER BY DESC(?created)
    `;

    const response = await query(queryString);

    if (response.results.bindings.length) {
        response.results.bindings.shift(); // don't remove latest report
        for (const binding of response.results.bindings) {
            await deleteReportInDatabase(binding.reportUri.value, namedGraph);
        }
        console.log("All reports deleted")
    }
}

async function deleteReportInDatabase(reportUri, namedGraph) {
    const queryString = `
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX prov: <http://www.w3.org/ns/prov#>
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
        PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
        PREFIX sh: <http://www.w3.org/ns/shacl#>

        DELETE WHERE {
        GRAPH ${sparqlEscapeUri(namedGraph)} {
            ${sparqlEscapeUri(reportUri)} sh:result ?result ;
            ?preport ?oreport .

            ?result ?presult ?oresult .
        }
        }
    `;
    await query(queryString);
}