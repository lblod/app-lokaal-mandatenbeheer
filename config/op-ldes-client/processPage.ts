// this is a winston logger
import { logger } from "../logger";
import { updateSudo } from "@lblod/mu-auth-sudo";
import { sparqlEscapeUri } from "mu";
import {
  BATCH_GRAPH,
  BYPASS_MU_AUTH,
  DIRECT_DATABASE_CONNECTION,
  TIME_PREDICATE,
  VERSION_PREDICATE,
} from "../environment";

async function replaceExistingData() {
  let options = {};
  if (BYPASS_MU_AUTH) {
    console.log(">>>>> bypassing mu-auth");
    options = {
      sparqlEndpoint: DIRECT_DATABASE_CONNECTION,
    };
  }
  await replaceBestuurseenheden(options);
  await moveBestuursorgaanAndMandate(options);
}

async function replaceBestuurseenheden(connectionOptions) {
  await updateSudo(
    `
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX org: <http://www.w3.org/ns/org#>

    DELETE {
      GRAPH <http://mu.semte.ch/graphs/public> {
        ?s ?pOld ?oOld.
      }
    }
    INSERT {
      GRAPH <http://mu.semte.ch/graphs/public> {
        ?s ?pNew ?oNew.
        ?s besluit:classificatie ?bestuurseenheidClassification.
      }
    } WHERE {
      VALUES ?bestuurseenheidClassifications {
        <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000> # Provincie
        <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001> # Gemeente
        <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000002> # OCMW
        <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000003> # District
        <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/a3922c6d-425b-474f-9a02-ffb71a436bfc> # Politiezone
      }
      GRAPH ${sparqlEscapeUri(BATCH_GRAPH)} {
        ?stream <https://w3id.org/tree#member> ?versionedMember .
        ?versionedMember ${sparqlEscapeUri(VERSION_PREDICATE)} ?s .
        ?versionedMember ?pNew ?oNew.
        ?versionedMember org:classification ?bestuurseenheidClassification.
        FILTER (?pNew NOT IN ( ${sparqlEscapeUri(
          VERSION_PREDICATE
        )}, ${sparqlEscapeUri(TIME_PREDICATE)} ))
      }
      OPTIONAL {
        GRAPH <http://mu.semte.ch/graphs/public> {
          ?s ?pOld ?oOld.
        }
      }
    }`,
    {},
    connectionOptions
  );
}

// we are counting on the ldes providing a direct link to the eenheid that owns the concept so we can put it
// in the right graph. This also means that the bestuurseenheid always needs to have been published before the concept itself
async function moveBestuursorgaanAndMandate(connectionOptions) {
  await updateSudo(
    `
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    DELETE {
      GRAPH ?targetGraph {
        ?s ?pOld ?oOld.
      }
    }
    INSERT {
      GRAPH ?targetGraph {
        ?s ?pNew ?oNew.
      }
    } WHERE {
      GRAPH ${sparqlEscapeUri(BATCH_GRAPH)} {
        ?stream <https://w3id.org/tree#member> ?versionedMember .
        ?versionedMember ${sparqlEscapeUri(VERSION_PREDICATE)} ?s .
        VALUES ?type {
          besluit:Bestuursorgaan
          mandaat:Mandaat
        }
        ?versionedMember a ?type.
        ?versionedMember ?pNew ?oNew.
        ?versionedMember ext:owningBestuurseenheid ?eenheid.
        FILTER (?pNew NOT IN ( ${sparqlEscapeUri(
          VERSION_PREDICATE
        )}, ${sparqlEscapeUri(TIME_PREDICATE)} ))
      }
      ?eenheid mu:uuid ?id.
      BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/", ?id, "/LoketLB-mandaatGebruiker")) AS ?targetGraph)
      OPTIONAL {
        GRAPH ?targetGraph {
          ?s ?pOld ?oOld.
        }
      }
    }`,
    {},
    connectionOptions
  );
}

export async function processPage() {
  logger.debug("Running custom logic to process the current page");
  await replaceExistingData();
  return;
}
