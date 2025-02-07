# SHACL Report service

The SHACL Report Generation Service is an example report script that runs within the Loket Report Generation Service. The report file `shacl-report.js` serves as an example to execute SHACL validations on a subset of the triple store.

The [SHACL engine library](https://github.com/rdf-ext/shacl-engine) from RDF-ext is used to execute the SHACL validations on RDF/JS objects. The `helper.js` file provides methods to convert data in Turtle format to RDF/JS and initialize the SHACL validator with the RDF-ext DataFactory. SHACL SPARQL-based Constraints are possible. However, keep in mind that not all SPARQL features are supported, such as nested queries. See [Github](https://github.com/rdf-ext/shacl-engine/tree/master/test/assets/data-shapes/sparql/pre-binding).

## Input data

The `shacl-report.js` file loads data for each Bestuurseenheid, because we want to provide each bestuurseenheid a separate report. A SPARQL CONSTRUCT query is used to retrieve the data. To limit the input size, triples are filtered to a certain bestuursperiode.

## Shape

All SHACL files that reside inside the `./config/shacl` folder will be merged into one shape. 

Note: if you have multiple shapes with the same target class (e.g. Mandataris), make sure to use the same node shape URI. This way, all validations on an instance will be performed in one run.

## helper.js

The report can access some helper functions that you can import from
`./helpers`. Those functions include (among others):

* `getBestuurseenhedenUriAndUuid(bestuurseenheidClassificaties)`: it returns an array of bestuurseenheden with their URI and uuid.
  * The `bestuurseenheidClassificaties` argument is the array of strings of bestuurseenheidclassificatie SKOS concept URIs (see [scheme](https://data.vlaanderen.be/doc/conceptscheme/BestuursorgaanClassificatieCode))
  * The output array contains objects with an `uri` and `id` key.

* `convertConstructQueryResponseToStore(queryResponse)`: it returns an N3 Store containing all triples of SPARQL query response.
  * The `queryResponse` argument is an SPARQL JSON result object of a SPARQL CONSTRUCT query

* `executeConstructQueryOnNamedGraph(uriAndUuid, bestuursperiodeLabel)`: it returns an N3 Store containing all triples of the bestuurseenheid in a certain bestuursperiode.
  * The `uriAndUuid` argument is an object with an `uri` and `id` of a bestuurseenheid
  * The `bestuursperiodeLabel` is a string of a bestuursperiode

* `deletePreviousReports(namedGraph)`: it deletes all, except the latest, SHACL reports and validation results contained within a named graph
  * The `namedGraph` argument is a string containg the `uri` of a named graph

* `parseTurtleString(turtleString)`: it returns an N3 Store containing all triples of the turtle string.
  * The `turtleString` argument is a string of data in Turtle format

* `validateDataset(dataset, shapesDataset)`: it returns an RDF-Ext SHACL validation report.
  * The `dataset` argument is an RDF/JS Dataset containing the triples that need to be validated
  * The `shapesDataset` argument is an RDF/JS Dataset containing the SHACL validation triples that are used for the validation

* `saveDatasetToNamedGraph(dataset, namedGraph)`: it inserts the triples of a RDF/JS dataset in the named graph of the triple store.
  * The `dataset` argument is an RDF/JS Dataset containing the triples (e.g. the dataset of the SHACL report)
  * The `namedGraph` argument is a string containing the URI of the named graph to be used in the SPARQL INSERT query