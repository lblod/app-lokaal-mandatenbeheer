# SHACL Report service

The SHACL Report Generation Service is an example report script that runs within the Loket Report Generation Service (the `report-generation` service in `docker-compose.yml`).

The [SHACL engine library](https://github.com/rdf-ext/shacl-engine) from RDF-ext is used to execute the SHACL validations on RDF/JS objects. The `helpers.js` file provides methods to convert data in Turtle format to RDF/JS and initialize the SHACL validator with the RDF-ext DataFactory. SHACL SPARQL-based Constraints are possible. However, keep in mind that not all SPARQL features are supported, such as nested queries. See [Github](https://github.com/rdf-ext/shacl-engine/tree/master/test/assets/data-shapes/sparql/pre-binding).

## Input data

The `shacl-report.js` file loads data for each Bestuurseenheid, because we want to provide each bestuurseenheid a separate report. SPARQL CONSTRUCT queries are used to retrieve the data. To limit the input size, triples are filtered to a certain bestuursperiode. The report for a bestuurseenheid is also stored in the graph of its OCMW, if it has one.

## Shapes

All SHACL files in `./config/shacl` are merged into one shape. SPARQL-based shapes live in `./config/sparql` (type `ext:SparqlShape`) and are executed on the triple store directly, because it's much more efficient (runtime in seconds instead of minutes).

Note: if you have multiple SPARQL-based constraints with the same target class (e.g. Mandataris), make sure to use a separate node shape URI per SPARQL query. Otherwise, we are not able to fetch the target class of the source shape for every validation result.

## helpers.js

The report can access some helper functions that you can import from
`./helpers.js`. Those functions include (among others):

* `getBestuurseenhedenUriAndUuidsToProcess(bestuurseenheidClassificaties)`: it returns an array of bestuurseenheden with their URI and uuid.
  * The `bestuurseenheidClassificaties` argument is the array of strings of bestuurseenheidclassificatie SKOS concept URIs (see [scheme](https://data.vlaanderen.be/doc/conceptscheme/BestuursorgaanClassificatieCode))
  * The output array contains objects with a `uri` and `id` key.

* `getBestuurseenheidUriAndUuid(bestuurseenheid)`: it returns the URI and uuid of a single bestuurseenheid.
  * The `bestuurseenheid` argument is the URI of the bestuurseenheid

* `executeConstructQueriesOnNamedGraph(uriAndUuid, targetBestuursperiode)`: it returns an N3 Store containing all triples of the bestuurseenheid (and its OCMW) in a certain bestuursperiode.
  * The `uriAndUuid` argument is an object with a `uri` and `id` of a bestuurseenheid
  * The `targetBestuursperiode` is the URI of a bestuursperiode

* `deletePreviousReports(namedGraphs)`: it deletes all, except the latest, SHACL reports and validation results contained within the named graphs
  * The `namedGraphs` argument is an array of strings containing the URIs of named graphs

* `parseTurtleString(turtleString)`: it returns an N3 Store containing all triples of the turtle string.
  * The `turtleString` argument is a string of data in Turtle format

* `validateDataset(dataset, shapesDataset)`: it returns an RDF-Ext SHACL validation report.
  * The `dataset` argument is an RDF/JS Dataset containing the triples that need to be validated
  * The `shapesDataset` argument is an RDF/JS Dataset containing the SHACL validation triples that are used for the validation

* `saveDatasetToNamedGraphs(dataset, namedGraphs)`: it inserts the triples of a RDF/JS dataset in the named graphs of the triple store.
  * The `dataset` argument is an RDF/JS Dataset containing the triples (e.g. the dataset of the SHACL report)
  * The `namedGraphs` argument is an array of strings containing the URIs of the named graphs to be used in the SPARQL INSERT query

## Configuration

The service can be configured with the following environment variables:

- `BESTUURSEENHEID_URI` [string]: the URI of a bestuurseenheid to filter on. By default, all bestuurseenheden are retrieved to validate. E.g. `http://data.lblod.info/id/bestuurseenheden/0a3ba641d653b436b14fde37bb6eab4f1054aa0586eb98021b723d58f6ce82fb`
- `TARGET_BESTUURSPERIODE` [string]: the uri of the bestuursperiode to filter on. By default: the uri for `2024 - heden`. E.g. `http://data.lblod.info/id/concept/Bestuursperiode/96efb929-5d83-48fa-bfbb-b98dfb1180c7`
- `RUN_REPORT_NOW` [true or false]: when set, this will start the creation of a report 10 seconds after the service is up.
- `ONLY_KEEP_LATEST_REPORT` [true or false]: when set, all previous reports for a bestuurseenheid are deleted after a new one is created. This is set to `true` in `docker-compose.yml`.
- `DEFAULT_GRAPH` [string]: the graph in which the report status is stored. This is set to `http://mu.semte.ch/graphs/reports` in `docker-compose.yml`.

`SHAPE_URI` is still defined (and read) by the service, but it is not used anymore: all shapes in the `shacl` and `sparql` folders are always validated.

## Testing new shapes

The easiest way to test new SPARQL queries is by following these steps:

- In case of SPARQL-based constraints, you can test your SPARQL query using the UI that is offered by Virtuoso (`http://localhost:8890/sparql`). Write a SELECT query that returns `?this`and `?value` (and optionally `?path`).
- To do some exploration whether the returned instance (`?this`) is really invalid, you can use `DESCRIBE <fill-in-uri-of-this>` to retrieve all data of the instance, and select format `Turtle (beautified - browser oriented)`. This gives you the ability to navigate to connected resources in the triple store.

When your query is ready, follow these steps:
- create a SHACL shape in a Turtle file inside the `shacl` folder
- Replace `?this` with `$this` in your query, because this is expected by the SHACL engine.
- don't run the reporting service container in development mode (makes validation much slower)
- configure the parameters mentioned above to limit validation to one bestuurseenheid and the shape you want to test
- pro-tip: when you were testing the query, you can already see which bestuurseenheden will have invalid validation results. Take one of those to test.
- send an HTTP POST to `/reports/generate` with the URI of the bestuurseenheid to generate a report for:

```bash
curl -X POST http://localhost/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"bestuurseenheidUri": "http://data.lblod.info/id/bestuurseenheden/0a3ba641d653b436b14fde37bb6eab4f1054aa0586eb98021b723d58f6ce82fb"}'
```

  The report is also generated daily by a cron job, and immediately after startup when `RUN_REPORT_NOW` is set.

Screening the results can be done using:
- go to `http://localhost:8890/sparql` and retrieve the latest report with following SPARQL query:

```sparql
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX dct: <http://purl.org/dc/terms/>

CONSTRUCT {
  ?report a sh:ValidationReport ;
    ?preport ?oreport .

  ?result ?presult ?oresult .
}
WHERE {
  GRAPH ?g {
    ?report a sh:ValidationReport ;
      ?preport ?oreport .

    OPTIONAL {
      ?report sh:result ?result .
      ?result ?presult ?oresult .
    }

    {
      SELECT ?report ?g
      WHERE {
        GRAPH ?g {
          ?report a sh:ValidationReport ;
            dct:created ?created .
        }
      }
      ORDER BY DESC(?created)
      LIMIT 1
    }
  }
}
```

- Go to the LMB frontend, log in with the configured bestuurseenheid, and go to the report route `/report` to visualize and further analyze the instances with validation errors. The issues of a specific report can also be fetched from the service at `/reports/:id/:eenheidId/issues`.
