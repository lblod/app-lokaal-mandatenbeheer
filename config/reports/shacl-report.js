import { mergeFilesContent, getBestuurseenhedenUriAndUuid, executeConstructQueryOnNamedGraph, parseTurtleString, validateDataset, enrichValidationReport, saveDatasetToNamedGraph, generateNamedGraphFromUuid } from "./helpers.js";

const reportName = "ShaclReport";

export default {
  cronPattern: "0 3 * * *",
  name: reportName,
  execute: async () => {
    console.log("report starts");
    const reportInfo = {
      title: reportName,
      description: "SHACL validatie per bestuur (gemeente en OCMW)",
      filePrefix: "report-shacl",
    };

    // Configure here the bestuurseenheidclassificaties (gemeente, OCMW) to validate
    const interestedBestuurseenheidClassificaties = [
        'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001',
        'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000002'
    ]
    // Configure the bestuursperiode to validate
    const bestuursperiodeLabel = '2019 - 2024';

    // Retrieve URI and UUID of bestuurseenheden
    const uriAndUuids = await getBestuurseenhedenUriAndUuid(interestedBestuurseenheidClassificaties);

    // Read all SHACL files in the shacl folder
    const shape = await mergeFilesContent('./config/shacl');
    const shapesDataset = await parseTurtleString(shape);
    
    // Validate for each bestuurseenheid 
    for (const uriAndUuid of uriAndUuids) {
      try {
        // Retrieve all triples within the bestuurseenheid graph limited to the bestuursperiode
        const dataDataset = await executeConstructQueryOnNamedGraph(uriAndUuid, bestuursperiodeLabel);

        console.log('Running SHACL validation...');
        const startTime = Date.now();
        const report = await validateDataset(dataDataset, shapesDataset);
        const endTime = Date.now();
        console.log(`SHACL validation took ${(endTime - startTime) / 1000} seconds.`);

        // Enrich validation report by removing blank nodes, adding timestamp etc.
        const enrichedValidationReportDataset = enrichValidationReport(report.dataset, shapesDataset);

        saveDatasetToNamedGraph(enrichedValidationReportDataset, generateNamedGraphFromUuid(uriAndUuid.uuid));
        console.log(`SHACL validation report saved in triple store.`);
      } catch (error) {
          console.error('Error:', error);
      }
    }
  },
};