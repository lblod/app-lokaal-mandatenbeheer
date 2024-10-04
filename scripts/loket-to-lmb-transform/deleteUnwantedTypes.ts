import { BATCH_SIZE, sparqlOptions } from "./constants";
import { querySudo, updateSudo } from "@lblod/mu-auth-sudo";

const desiredTypes = [
  "http://data.vlaanderen.be/ns/mandaat#Verkiezingsresultaat",
  "http://data.vlaanderen.be/ns/besluit#Bestuursorgaan",
  "http://data.vlaanderen.be/ns/mandaat#Mandaat",
  "http://data.vlaanderen.be/ns/mandaat#Kandidatenlijst",
  "http://xmlns.com/foaf/0.1/OnlineAccount",
  "http://xmlns.com/foaf/0.1/Person",
  "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid",
  "http://www.w3.org/2004/02/skos/core#Concept",
  "http://www.w3.org/ns/adms#Identifier",
  // "http://www.w3.org/ns/locn#Address",
  "http://data.vlaanderen.be/ns/mandaat#RechtstreekseVerkiezing",
  "http://www.w3.org/ns/prov#Location",
  "http://publications.europa.eu/ontology/euvoc#Country",
  "http://mu.semte.ch/vocabularies/ext/BeleidsdomeinCode",
  "http://mu.semte.ch/vocabularies/ext/BestuursfunctieCode",
  "http://data.europa.eu/m8g/PeriodOfTime",
  "http://www.w3.org/2004/02/skos/core#ConceptScheme",
  "http://mu.semte.ch/vocabularies/ext/BestuursorgaanClassificatieCode",
  "http://mu.semte.ch/vocabularies/ext/BestuurseenheidClassificatieCode",
  "http://lblod.data.gift/vocabularies/organisatie/BestuursorgaanClassificatieCode",
  "http://mu.semte.ch/vocabularies/ext/GeslachtCode",
  "http://mu.semte.ch/vocabularies/ext/KandidatenlijstLijsttype",
  "http://lblod.data.gift/vocabularies/organisatie/BestuurseenheidClassificatieCode",
  "http://www.w3.org/ns/org#Role",
  "http://mu.semte.ch/vocabularies/ext/MandatarisStatusCode",
  "http://mu.semte.ch/vocabularies/ext/VerkiezingsresultaatGevolgCode",
  "http://mu.semte.ch/vocabularies/ext/Fractietype",
  "http://www.w3.org/2000/01/rdf-schema#Class",
];

async function countUnwantedTypeTriples() {
  const res = await querySudo(
    `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT (COUNT(*) as ?count) {
      GRAPH <http://mu.semte.ch/graphs/public> {
        ?s a ?type .
        ?s ?p ?o .
        FILTER(?p != rdf:type && ?type NOT IN (${desiredTypes
          .map((type) => `<${type}>`)
          .join(",")}))
      }
    }
  `,
    {},
    sparqlOptions
  );
  return parseInt(res.results.bindings[0].count.value);
}

async function hasUnwantedType() {
  const res = await querySudo(
    `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    ASK {
      GRAPH <http://mu.semte.ch/graphs/public> {
        ?s a ?type .
        ?s ?p ?o .
        FILTER(?p != rdf:type && ?type NOT IN (${desiredTypes
          .map((type) => `<${type}>`)
          .join(",")}))
      }
    }
  `,
    {},
    sparqlOptions
  );
  return res.boolean;
}

async function deleteBatchOfUnwantedTypes() {
  const update = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

  DELETE {
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?s ?p ?o.
      ?oo ?pp ?s.
    }
  }
  WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
      { ?s a ?thing. }
      FILTER(?thing NOT IN (${desiredTypes
        .map((type) => `<${type}>`)
        .join(",")}))
      {
        ?s ?p ?o.
        FILTER (?p != rdf:type)
      } UNION {
        ?oo ?pp ?s.
      }
    }
  } LIMIT ${BATCH_SIZE}`;

  await updateSudo(update, {}, sparqlOptions);
}

async function countUnWantedTypeDeclarations() {
  const res = await querySudo(
    `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT (COUNT(*) as ?count) {
      GRAPH <http://mu.semte.ch/graphs/public> {
        ?s a ?type .
        FILTER(?type NOT IN (${desiredTypes
          .map((type) => `<${type}>`)
          .join(",")}))
      }
    }
  `,
    {},
    sparqlOptions
  );
  return parseInt(res.results.bindings[0].count.value);
}

async function hasUnWantedTypeDeclaration() {
  const res = await querySudo(
    `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    ASK {
      GRAPH <http://mu.semte.ch/graphs/public> {
        ?s a ?type .
        FILTER(?type NOT IN (${desiredTypes
          .map((type) => `<${type}>`)
          .join(",")}))
      }
    }
  `,
    {},
    sparqlOptions
  );
  return res.boolean;
}

async function deleteBatchOfUnwantedTypeDeclarations() {
  const update = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

  DELETE {
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?s a ?thing.
    }
  }
  WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
      { ?s a ?thing. }
      FILTER(?thing NOT IN (${desiredTypes
        .map((type) => `<${type}>`)
        .join(",")}))
    }
  } LIMIT ${BATCH_SIZE}`;

  await updateSudo(update, {}, sparqlOptions);
}

export async function deleteUnwantedTypes() {
  console.log("Deleting unwanted type triples...");
  let count = await countUnwantedTypeTriples();
  let deleted = 0;
  while (await hasUnwantedType()) {
    await deleteBatchOfUnwantedTypes();
    deleted += BATCH_SIZE;
    console.log(
      `Deleted ${deleted}/${count} unwanted type triples... (${(
        (deleted / count) *
        100
      ).toFixed(2)}%)`
    );
  }
  console.log("done!");
  console.log("Deleting unwanted type declarations...");
  count = await countUnWantedTypeDeclarations();
  deleted = 0;
  while (await hasUnWantedTypeDeclaration()) {
    await deleteBatchOfUnwantedTypeDeclarations();
    deleted += BATCH_SIZE;
    console.log(
      `Deleted ${deleted}/${count} unwanted type declarations...(${(
        (deleted / count) *
        100
      ).toFixed(2)}%)`
    );
  }
  console.log("done!");
}
