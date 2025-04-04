import {
  mergeFilesContent,
  getBestuurseenheidUriAndUuid,
  getBestuurseenhedenUriAndUuidsToProcess,
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

const cronFunction = async () => {
  console.log("report starts");
  const reportInfo = {
    title: reportName,
    description: "SHACL validatie per bestuur (gemeente en OCMW)",
    filePrefix: "report-shacl",
  };

  // Configure here the bestuurseenheidclassificaties (gemeente, OCMW) to validate
  const interestedBestuurseenheidClassificaties = [
    "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001",
    // since we also include the ocmw data when validating the gemeente, we don't need to validate ocmw separately
    // "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000002",
  ];

  let uriAndUuids = [];
  if (BESTUURSEENHEID_URI === undefined) {
      // Retrieve URI and UUID of bestuurseenheden
    uriAndUuids = await getBestuurseenhedenUriAndUuidsToProcess(
      interestedBestuurseenheidClassificaties
    );
  } else {
    const uriAndUuid = await getBestuurseenheidUriAndUuid(BESTUURSEENHEID_URI);
    if (uriAndUuid === undefined) throw new Error(`UUID not found for bestuurseenheid ${BESTUURSEENHEID_URI}`);
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

  console.log(
    `Will process ${uriAndUuids.length} bestuurseenheden during this run`
  );

  // Validate for each bestuurseenheid
  for (const uriAndUuid of uriAndUuids) {
    try {
      const namedGraphs = await getNamedGraphsForBestuurseenheidId(
        uriAndUuid.uuid
      );

      if (ONLY_KEEP_LATEST_REPORT) {
        await deletePreviousReports(namedGraphs);
      }
      // Retrieve all triples within the bestuurseenheid graph limited to the bestuursperiode
      const dataDataset = await executeConstructQueriesOnNamedGraph(
        uriAndUuid,
        BESTUURSPERIODE_LABEL
      );

      console.log(
        `Running SHACL validation for bestuurseenheid ${uriAndUuid.uuid} on store of size ${dataDataset.size}...`
      );
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

      await saveDatasetToNamedGraphs(enrichedValidationReportDataset, namedGraphs);
      console.log(`SHACL validation report saved in triple store.`);

      if (ONLY_KEEP_LATEST_REPORT) {
        await deletePreviousReports(namedGraphs);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    console.log(
      `SHACL validation for bestuurseenheid ${uriAndUuid.uuid} done.`
    );
  }
  console.log(`Done processing ${uriAndUuids.length} bestuurseenheden.`);
};

export default {
  cronPattern: "0 3 * * *",
  name: reportName,
  execute: cronFunction,
};

if (process.env.RUN_REPORT_NOW) {
  console.log("Running report in 10 seconds");
  setTimeout(() => cronFunction(), 10000);
}
