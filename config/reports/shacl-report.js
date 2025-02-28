import {
  mergeFilesContent,
  getBestuurseenhedenUriAndUuid,
  getBestuurseenheidUriAndUuid,
  executeConstructQueriesOnNamedGraph,
  parseTurtleString,
  validateDataset,
  enrichValidationReport,
  saveDatasetToNamedGraphs,
  deletePreviousReports,
  getNamedGraphsForBestuurseenheidId,
} from "./helpers.js";
import env from "env-var";

import { DataFactory, Store } from "n3";
const { namedNode } = DataFactory;

const ONLY_KEEP_LATEST_REPORT =
  process.env.ONLY_KEEP_LATEST_REPORT != undefined
    ? env.get("ONLY_KEEP_LATEST_REPORT").asBool()
    : false;

const BESTUURSEENHEID_URI = env.get("BESTUURSEENHEID_URI").asString();

const BESTUURSPERIODE_LABEL = process.env.BESTUURSPERIODE_LABEL != undefined
? env.get("BESTUURSPERIODE_LABEL").asString()
: '2024 - heden';

const SHAPE_URI = env.get("SHAPE_URI").asString();

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

    let uriAndUuids = [];
    if (BESTUURSEENHEID_URI === undefined) {
      // Configure here the bestuurseenheidclassificaties (gemeente, OCMW) to validate
      const interestedBestuurseenheidClassificaties = [
        "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001",
        // since we also include the ocmw data when validating the gemeente, we don't need to validate ocmw separately
        // "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000002",
      ];

      // Retrieve URI and UUID of bestuurseenheden
      uriAndUuids = await getBestuurseenhedenUriAndUuid(
        interestedBestuurseenheidClassificaties
      );
    } else {
      const uriAndUuid = await getBestuurseenheidUriAndUuid(BESTUURSEENHEID_URI);
      if (uriAndUuid === undefined) throw `UUID not found for bestuurseenheid ${BESTUURSEENHEID_URI}`;
      uriAndUuids.push(uriAndUuid);
    }

    // Read all SHACL files in the shacl folder
    const shape = await mergeFilesContent("./config/shacl");
    let shapesDataset = await parseTurtleString(shape);

    if (SHAPE_URI) {
      // Remove other shapes from shapes dataset
      let shapesDatasetFilteredOnShape = new Store();
      const shapes = shapesDataset.getSubjects(namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/ns/shacl#NodeShape')).map((subject) => subject.value);
      for (const quad of shapesDataset) {
        if (quad.subject.value === SHAPE_URI || !shapes.includes(quad.subject.value)) {
          shapesDatasetFilteredOnShape.add(quad);
        }
      }
      shapesDataset = shapesDatasetFilteredOnShape;
    }
    
    // Validate for each bestuurseenheid
    for (const uriAndUuid of uriAndUuids) {
      try {
        // Retrieve all triples within the bestuurseenheid graph limited to the bestuursperiode
        const dataDataset = await executeConstructQueriesOnNamedGraph(
          uriAndUuid,
          BESTUURSPERIODE_LABEL
        );

        console.log("Running SHACL validation...");
        const startTime = Date.now();
        const report = await validateDataset(dataDataset, shapesDataset);
        const endTime = Date.now();
        console.log(
          `SHACL validation took ${(endTime - startTime) / 1000} seconds.`
        );

        // Enrich validation report by removing blank nodes, adding timestamp etc.
        const enrichedValidationReportDataset = enrichValidationReport(
          report.dataset,
          shapesDataset,
          dataDataset
        );

        const namedGraphs = await getNamedGraphsForBestuurseenheidId(
          uriAndUuid.uuid
        );

        saveDatasetToNamedGraphs(enrichedValidationReportDataset, namedGraphs);
        console.log(`SHACL validation report saved in triple store.`);

        if (ONLY_KEEP_LATEST_REPORT) {
          await deletePreviousReports(namedGraphs);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  },
};
