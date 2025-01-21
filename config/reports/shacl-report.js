import { generateReportFromData, batchedQuery } from "../helpers.js";
import { query } from 'mu';

import { getBestuurseenhedenUuid, executeConstructQueryOnNamedGraph, parseTurtleString, validateDataset, getMappingNodeShapeToTargetClassFromShapeDataset, getNodeShapeURI, enrichValidationReport, saveDatasetToNamedGraph } from "./helpers.js";

const reportName = "ShaclReport";

export default {
  cronPattern: "0 3 * * *",
  name: reportName,
  execute: async () => {
    console.log("report starts");
    const reportInfo = {
      title: reportName,
      description: "Resultaat van SHACL per bestuur",
      filePrefix: "report-shacl",
    };

    const interestedBestuurseenheidClassificaties = [
        'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001',
        'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000002'
    ]
    const uuids = await getBestuurseenhedenUuid(interestedBestuurseenheidClassificaties);

    for (const uuid of uuids) {
        const namedGraph = `http://mu.semte.ch/graphs/organizations/${uuid}/LoketLB-mandaatGebruiker`;
        const dataDataset = await executeConstructQueryOnNamedGraph(namedGraph);
        
        const shape = `
          @prefix sh: <http://www.w3.org/ns/shacl#> .
          @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

          <http://example.org/mandataris_1_5_blueprint>
            a sh:NodeShape ;
            sh:targetClass <http://data.vlaanderen.be/ns/mandaat#Mandataris> ;
            sh:prefixes [ sh:declare [
                  a sh:PrefixDeclaration ;
                  sh:namespace "http://data.vlaanderen.be/ns/besluit#"^^xsd:anyURI ;
                  sh:prefix "besluit" ;
              ] ], [ sh:declare [
                  a sh:PrefixDeclaration ;
                  sh:namespace "http://data.vlaanderen.be/ns/mandaat#"^^xsd:anyURI ;
                  sh:prefix "mandaat" ;
              ] ], [ sh:declare [
                  a sh:PrefixDeclaration ;
                  sh:namespace "http://www.w3.org/ns/org#"^^xsd:anyURI ;
                  sh:prefix "org" ;
              ] ], [ sh:declare [
                  a sh:PrefixDeclaration ;
                  sh:namespace "http://lblod.data.gift/vocabularies/lmb/"^^xsd:anyURI ;
                  sh:prefix "lmb" ;
              ] ];
            sh:sparql [
              sh:select """
              PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
              PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
              PREFIX org: <http://www.w3.org/ns/org#>
              PREFIX lmb: <http://lblod.data.gift/vocabularies/lmb/>

              select $this ?value
              where {
                  $this a mandaat:Mandataris .
                  FILTER NOT EXISTS {
                      $this mandaat:status ?mandatarisStatusCode .
                  }
                
                  BIND ("Mandataris heeft geen status." as ?value)
              }""" ;
                  sh:message "Mandataris heeft geen status."
          ] .
          `;
        // Validation
        try {
          const shapesDataset = await parseTurtleString(shape);
          console.log('Running SHACL validation...');
          const report = await validateDataset(dataDataset, shapesDataset);
          const enrichedValidationReportDataset = enrichValidationReport(report.dataset, shapesDataset);
          console.log(enrichedValidationReportDataset);
          saveDatasetToNamedGraph(enrichedValidationReportDataset, namedGraph);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // await generateReportFromData(
    //   uuids,
    //   ["Bestuur"],
    //   reportInfo
    // );
  },
};

function formatDate(isoString) {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}