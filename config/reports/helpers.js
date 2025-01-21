import { query, update, sparqlEscapeUri, uuid } from 'mu';
import {SparqlJsonParser} from "sparqljson-parse";

import { Parser, Store, DataFactory } from 'n3';
const { namedNode, literal, defaultGraph, quad } = DataFactory;

import { report } from 'process';

export async function getBestuurseenhedenUuid(bestuurseenheidClassificaties) {
    let sparqlValuesBestuurseenheidClassificaties =  ``;
    if (bestuurseenheidClassificaties && bestuurseenheidClassificaties.length) {
        sparqlValuesBestuurseenheidClassificaties =  `VALUES ?bestuurseenheidClassificatie {${bestuurseenheidClassificaties.map((b) => `${sparqlEscapeUri(b)} `).join('')}}`;
    }
    // VALUES ?bestuurseenheidClassificatie { <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000002>  <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001> }
    const queryStringBestuurseenheden = `
        PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX proces: <https://data.vlaanderen.be/ns/proces#>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX adms: <http://www.w3.org/ns/adms#>
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

        SELECT DISTINCT ?uuid
        WHERE {
            ?bestuurseenheid a besluit:Bestuurseenheid ;
                            mu:uuid ?uuid ;
                            besluit:classificatie ?bestuurseenheidClassificatie .
        
            ${sparqlValuesBestuurseenheidClassificaties}
        }
        LIMIT 1
    `;
    //const queryResponse = await batchedQuery(queryStringBestuurseenheden);
    const queryResponse = await query(queryStringBestuurseenheden);

    const uuids = queryResponse.results.bindings.map((res) => res.uuid.value);

    return uuids;
}

export async function executeConstructQueryOnNamedGraph(namedGraph) {
    console.log('execute construct');
    const queryStringConstructOfGraph = `
    CONSTRUCT {
        ?s ?p ?o .
    }
    WHERE {
        GRAPH <${namedGraph}> {
            ?s ?p ?o .
        }
    }
    LIMIT 1000
    `;

    const queryResponse = await query(queryStringConstructOfGraph);
    const sparqlJsonParser = new SparqlJsonParser();
    const rdfJsObjects = sparqlJsonParser.parseJsonResults(queryResponse);

    // Create an N3 store
    const store = new Store();

    // Add RDFJS objects to the store
    rdfJsObjects.forEach((quad) => {
        store.addQuad(
            quad.s,
            quad.p,
            quad.o,
            quad.g || undefined // Optional: Include a graph if your RDFJS object contains it
        );
    });

    console.log(`Store contains ${store.size} triples.`);

    return store;
}

export async function parseTurtleString(turtleString) {
    const parser = new Parser();
    const store = new Store();

    // Parse the Turtle string into quads
    const quads = parser.parse(turtleString);

    // Add all parsed quads to the store
    store.addQuads(quads);

    // Return the populated store
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
    // run the validation process
    const report = await validator.validate({ dataset: dataset });
    // check if the data conforms to the given shape
    // console.log(`conforms: ${report.conforms}`);
    // print the report in N-Triples format
    // console.log(`report: ${  console.log(toNT(report.dataset))    }`);
    // get the covered quads
    //console.log('coverage:')
    // one quad may show up multiple times -> put it into a dataset
    //const coverage = rdfDataset.dataset(report.coverage())
    // print the unique quads
    //console.log(toNT(coverage))
    return report;
}

export function enrichValidationReport(reportDataset, shapesDataset) {
    const validationResults = reportDataset.match(null, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/ns/shacl#ValidationResult'));
    for (const validationResultQuad of validationResults) {
        // Retrieve targetClass of shape of ValidationResult
        const sourceShapeQuads = reportDataset.match(validationResultQuad.subject, namedNode('http://www.w3.org/ns/shacl#sourceShape'), null);
        if(!sourceShapeQuads.size) throw "No source shape found on validation result";
        const [sourceShapeQuad] = sourceShapeQuads;
        const targetClassQuads = shapesDataset.match(sourceShapeQuad.object, namedNode('http://www.w3.org/ns/shacl#targetClass'), null);
        if(!targetClassQuads.size) throw "No targetClass found on source shape";
        const [targetClassQuad] = targetClassQuads;

        // Add targetClass to validation result
        reportDataset.add(quad(
            validationResultQuad.subject,
            namedNode('http://lblod.data.gift/vocabularies/lmb/targetClassOfFocusNode'),
            namedNode(targetClassQuad.object.value)
        ));
        // Replace blank node of ValidationResult with UUID-based URI
        const validationResultUUID = uuid();
        const validationResultURI = `http://data.lblod.info/id/validationresults/${validationResultUUID}`;

        const triplesOfValidationResult = reportDataset.match(validationResultQuad.subject, null, null);
        for (const resultQuad of triplesOfValidationResult) {
            if (resultQuad.predicate.value != 'http://www.w3.org/ns/shacl#sourceConstraint') {
                reportDataset.add(quad(
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
            reportDataset.add(quad(
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
                literal(new Date())
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


export async function saveDatasetToNamedGraph(enrichedReportDataset, namedGraph) {
    console.log(enrichedReportDataset.toString());

    for (const quad of enrichedReportDataset) {
        const filteredDataset = enrichedReportDataset.match(quad.subject, quad.predicate, quad.object);
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
        console.log(queryString);
        await update(queryString);
    }
}