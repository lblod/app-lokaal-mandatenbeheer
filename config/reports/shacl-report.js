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
  quadsToTtl,
} from "./helpers.js";
import env from "env-var";
import {
  insertReportStatusInGraphs,
  updateReportStatusWithReport,
} from "./report-status.js";
import { app, uuid } from "mu";
import { querySudo } from "@lblod/mu-auth-sudo";
import { DataFactory } from "n3";
const { quad, literal, namedNode } = DataFactory;

const ONLY_KEEP_LATEST_REPORT =
  process.env.ONLY_KEEP_LATEST_REPORT != undefined
    ? env.get("ONLY_KEEP_LATEST_REPORT").asBool()
    : false;
const DIRECT_DATABASE_CONNECTION =
  process.env.DIRECT_DATABASE_CONNECTION || "http://virtuoso:8890/sparql";
const BESTUURSEENHEID_URI = env.get("BESTUURSEENHEID_URI").asString();

const TARGET_BESTUURSPERIODE =
  process.env.TARGET_BESTUURSPERIODE != undefined
    ? env.get("TARGET_BESTUURSPERIODE").asString()
    : "http://data.lblod.info/id/concept/Bestuursperiode/96efb929-5d83-48fa-bfbb-b98dfb1180c7";

const SHAPE_URI = env.get("SHAPE_URI").asString();

const reportName = "ShaclReport";

const cronFunction = async (bestuurseenheidUri = null) => {
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
  if (BESTUURSEENHEID_URI === undefined && !bestuurseenheidUri) {
    // Retrieve URI and UUID of bestuurseenheden
    uriAndUuids = await getBestuurseenhedenUriAndUuidsToProcess(
      interestedBestuurseenheidClassificaties
    );
  } else {
    const uriAndUuid = await getBestuurseenheidUriAndUuid(
      bestuurseenheidUri || BESTUURSEENHEID_URI
    );
    if (uriAndUuid === undefined)
      throw new Error(
        `UUID not found for bestuurseenheid ${
          bestuurseenheidUri || BESTUURSEENHEID_URI
        }`
      );
    uriAndUuids.push(uriAndUuid);
  }

  // Read all SHACL files in the shacl folder
  const shape = await mergeFilesContent("./config/shacl");
  const sparqlShapes = await mergeFilesContent("./config/sparql");
  const shapesDataset = await parseTurtleString(shape);
  const sparqlShapeDataset = await parseTurtleString(sparqlShapes);
  const sparqlValidationObjects = await getSparqlValidationObjects(
    sparqlShapeDataset
  );
  console.log(
    `Will process ${uriAndUuids.length} bestuurseenheden during this run`
  );

  // Validate for each bestuurseenheid
  for (const uriAndUuid of uriAndUuids) {
    try {
      const namedGraphs = await getNamedGraphsForBestuurseenheidId(
        uriAndUuid.uuid
      );
      const statusUri = await insertReportStatusInGraphs(
        uriAndUuid,
        namedGraphs
      );

      if (ONLY_KEEP_LATEST_REPORT) {
        await deletePreviousReports(namedGraphs);
      }
      // Retrieve all triples within the bestuurseenheid graph limited to the bestuursperiode
      const dataDataset = await executeConstructQueriesOnNamedGraph(
        uriAndUuid,
        TARGET_BESTUURSPERIODE
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
      const { reportUri, reportDataset } = enrichValidationReport(
        report.dataset,
        shapesDataset,
        dataDataset
      );

      await addSparqlValidationsToReport(
        dataDataset,
        reportDataset,
        sparqlValidationObjects
      );

      await saveDatasetToNamedGraphs(reportDataset, namedGraphs);
      await updateReportStatusWithReport(statusUri, reportUri, namedGraphs);
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

async function getSparqlValidationObjects(shapesDataset) {
  const shapes = shapesDataset
    .getSubjects(
      namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      namedNode("http://mu.semte.ch/vocabularies/ext/SparqlShape")
    )
    .map((subject) => subject.value);
  console.log(`Found ${shapes.length} sparql shapes`);
  const sparqlShapes = {};
  shapes.forEach((shapeSubject) => {
    try {
      const sparql = shapesDataset.getQuads(
        shapeSubject,
        namedNode("http://www.w3.org/ns/shacl#sparql"),
        null,
        null
      )[0];
      const query = shapesDataset.getQuads(
        sparql.object,
        namedNode("http://www.w3.org/ns/shacl#select"),
        null,
        null
      )[0].object.value;
      const message = shapesDataset.getQuads(
        sparql.object,
        namedNode("http://www.w3.org/ns/shacl#message"),
        null,
        null
      )[0].object.value;
      sparqlShapes[shapeSubject] = {
        query: query,
        message: message,
        uri: shapeSubject,
      };
    } catch (e) {
      console.error(
        `Error while processing SPARQL shape ${shapeSubject}: ${e}`
      );
    }
  });

  return sparqlShapes;
}

async function addSparqlValidationsToReport(
  dataDataset,
  reportDataset,
  sparqlValidationObjects
) {
  const graph = await loadDatasetToTempGraph(dataDataset);
  try {
    const results = await runSparqlValidations(graph, sparqlValidationObjects);
    await addResultsToReport(results, reportDataset, dataDataset);
  } catch (e) {
    console.error(`Error while running SPARQL validations: ${e}`);
  }
  await dropTempGraph(graph);
}

async function runSparqlValidations(graph, sparqlValidationObjects) {
  const validationResults = {};
  for (const sparqlValidationObject of Object.values(sparqlValidationObjects)) {
    const insertPos = sparqlValidationObject.query
      .toLowerCase()
      .indexOf("where");
    const query =
      sparqlValidationObject.query.substring(0, insertPos) +
      `FROM <${graph}>\n` +
      sparqlValidationObject.query.substring(insertPos);
    console.log(`Running SPARQL validation query: ${query}`);
    const result = await querySudo(
      query,
      {},
      { sparqlEndpoint: DIRECT_DATABASE_CONNECTION }
    );
    if (result?.results?.bindings && result.results.bindings.length > 0) {
      validationResults[sparqlValidationObject.uri] = [];
      result.results.bindings.forEach((binding) => {
        validationResults[sparqlValidationObject.uri].push({
          target: binding.this.value,
          value: binding.value?.value,
          message: sparqlValidationObject.message,
        });
      });
    }
  }

  console.log(
    `Found ${
      Object.keys(validationResults).length
    } SPARQL validation results: ${JSON.stringify(validationResults, null, 2)}`
  );
  return validationResults;
}

async function addResultsToReport(
  validationResults,
  reportDataset,
  dataDataset
) {
  const [reportUri] = reportDataset.match(
    null,
    namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    namedNode("http://www.w3.org/ns/shacl#ValidationReport"),
    null
  );

  Object.keys(validationResults).forEach((validationUri) => {
    const errors = validationResults[validationUri];
    errors.forEach((error) => {
      const id = uuid();
      const errorUri = `http://data.lblod.info/id/validationresults/${id}`;
      const targetClass = dataDataset.match(
        namedNode(error.target),
        namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        null,
        null
      );
      if (targetClass.size) {
        const [targetClassQuad] = targetClass;
        reportDataset.add(
          quad(
            namedNode(errorUri),
            namedNode(
              "http://lblod.data.gift/vocabularies/lmb/targetClassOfFocusNode"
            ),
            namedNode(targetClassQuad.object.value)
          )
        );
      }
      const targetId = dataDataset.match(
        namedNode(error.target),
        namedNode("http://mu.semte.ch/vocabularies/core/uuid"),
        null,
        null
      );
      if (targetId.size) {
        const [targetIdQuad] = targetId;
        reportDataset.add(
          quad(
            namedNode(errorUri),
            namedNode(
              "http://lblod.data.gift/vocabularies/lmb/targetIdOfFocusNode"
            ),
            literal(targetIdQuad.object.value)
          )
        );
      }
      reportDataset.add(
        quad(
          reportUri.subject,
          namedNode("http://www.w3.org/ns/shacl#result"),
          namedNode(errorUri)
        )
      );
      reportDataset.add(
        quad(
          namedNode(errorUri),
          namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          namedNode("http://www.w3.org/ns/shacl#ValidationResult")
        )
      );
      reportDataset.add(
        quad(
          namedNode(errorUri),
          namedNode("http://mu.semte.ch/vocabularies/core/uuid"),
          literal(id)
        )
      );

      if (error.message) {
        reportDataset.add(
          quad(
            namedNode(errorUri),
            namedNode("http://www.w3.org/ns/shacl#resultMessage"),
            literal(error.message)
          )
        );
      }
      reportDataset.add(
        quad(
          namedNode(errorUri),
          namedNode("http://www.w3.org/ns/shacl#focusNode"),
          namedNode(error.target)
        )
      );
      reportDataset.add(
        quad(
          namedNode(errorUri),
          namedNode("http://www.w3.org/ns/shacl#sourceShape"),
          namedNode(validationUri)
        )
      );
      reportDataset.add(
        quad(
          namedNode(errorUri),
          namedNode("http://www.w3.org/ns/shacl#sourceConstraintComponent"),
          namedNode(validationUri)
        )
      );
      if (error.value) {
        reportDataset.add(
          quad(
            namedNode(errorUri),
            namedNode("http://www.w3.org/ns/shacl#value"),
            literal(error.value)
          )
        );
      }
      reportDataset.add(
        quad(
          namedNode(errorUri),
          namedNode("http://www.w3.org/ns/shacl#resultSeverity"),
          namedNode("http://www.w3.org/ns/shacl#Error")
        )
      );
    });
  });
}

async function dropTempGraph(graph) {
  await querySudo(
    `DROP SILENT GRAPH <${graph}>`,
    {},
    { sparqlEndpoint: DIRECT_DATABASE_CONNECTION }
  );
  await querySudo(
    `DELETE DATA {
      GRAPH <http://mu.semte.ch/graphs/public> {
        <${graph}> a <http://mu.semte.ch/vocabularies/ext/ValidationWorkingGraph> .
      }
    } `,
    {},
    { sparqlEndpoint: DIRECT_DATABASE_CONNECTION }
  );
}

async function loadDatasetToTempGraph(dataset) {
  const id = uuid();
  const graph = `http://mu.semte.ch/graphs/temp/validation/${id}`;
  let batch = [];
  const insertBatch = async () => {
    const ttl = await quadsToTtl(batch);
    await querySudo(
      `INSERT DATA {
      GRAPH <${graph}> { ${ttl} }
      GRAPH <http://mu.semte.ch/graphs/public> {
        <${graph}> a <http://mu.semte.ch/vocabularies/ext/ValidationWorkingGraph> .
      }
    }`,
      {},
      { sparqlEndpoint: DIRECT_DATABASE_CONNECTION }
    );
  };
  for (let quad of dataset) {
    batch.push(quad);
    if (batch.length > 1000) {
      await insertBatch();
      batch = [];
    }
  }
  if (batch.length > 0) {
    await insertBatch();
  }

  return graph;
}

export default {
  cronPattern: "0 3 * * *",
  name: reportName,
  execute: cronFunction,
};

if (process.env.RUN_REPORT_NOW) {
  console.log("Running report in 10 seconds");
  setTimeout(() => cronFunction(), 10000);
}

app.post("/reports/generate", async (req, res) => {
  const bestuurseenheidUri = req.body.bestuurseenheidUri;
  if (!bestuurseenheidUri) {
    console.log(
      `A bestuurseenheidUri must be provided for triggering the manual report generation.`
    );
    return;
  }

  console.log(
    `Manually trigged creation of validation report for bestuurseenheid uri: ${bestuurseenheidUri}`
  );
  cronFunction(bestuurseenheidUri);

  res.status(204).send();
});
