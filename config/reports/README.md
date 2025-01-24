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

* `executeConstructQueryOnNamedGraph(uriAndUuid, bestuursperiodeLabel)`: it returns an N3 Store containing all triples of the bestuurseenheid in a certain bestuursperiode.
  * The `uriAndUuid` argument is an object with an `uri` and `id` of a bestuurseenheid
  * The `bestuursperiodeLabel` is a string of a bestuursperiode

* `parseTurtleString(turtleString)`: it returns an N3 Store containing all triples of the turtle string.
  * The `turtleString` argument is a string of data in Turtle format

* `validateDataset(dataset, shapesDataset)`: it returns an RDF-Ext SHACL validation report.
  * The `dataset` argument is an RDF/JS Dataset containing the triples that need to be validated
  * The `shapesDataset` argument is an RDF/JS Dataset containing the SHACL validation triples that are used for the validation


* `saveDatasetToNamedGraph(dataset, namedGraph)`: it inserts the triples of a RDF/JS dataset in the named graph of the triple store.
  * The `dataset` argument is an RDF/JS Dataset containing the triples (e.g. the dataset of the SHACL report)
  * The `namedGraph` argument is a string containing the URI of the named graph to be used in the SPARQL INSERT query

## Note

The loket-report-generation-service must have the rdf-ext and shacl-engine depencies. 
Until these dependencies have been added (see [PR](https://github.com/lblod/loket-report-generation-service/pull/12)), you must add these dependencies to your local build:

```
git clone git@github.com:lblod/loket-report-generation-service.git
cd loket-report-generation-service
npm install rdf-ext shacl-engine
```

Mount the local version in `docker-compose.override.yml`:

```
  report-generation:
    restart: "no"
    ports:
      - 8889:80
      - 9224:9229
    environment:
        NODE_ENV: "development"
    volumes:
      - ../loket-report-generation-service/:/app/
```

