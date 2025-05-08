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
  await replaceFracties(options);
  await replaceMandatees(options);
  await replaceMembership(options);
  await replacePeople(options);
}

async function replaceFracties(connectionOptions) {
  await updateSudo(
    `
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    DELETE {
      GRAPH ?targetGraph {
        ?s ?pOld ?oOld.
      }
    }
    INSERT {
      GRAPH ?targetGraph {
        ?s ?pNew?oNew.
      }
    } WHERE {
      GRAPH ${sparqlEscapeUri(BATCH_GRAPH)} {
        ?stream <https://w3id.org/tree#member> ?versionedMember .
        ?versionedMember ${sparqlEscapeUri(VERSION_PREDICATE)} ?s .
        ?versionedMember a mandaat:Mandataris .
        ?versionedMember ?pNew ?oNew .
        ?versionedMember org:linkedTo ?bestuurseenheid .
        FILTER (?pNew NOT IN ( ${sparqlEscapeUri(
          VERSION_PREDICATE
        )}, ${sparqlEscapeUri(TIME_PREDICATE)} ))
      }
      ?targetGraph ext:ownedBy ?bestuurseenheid .
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

async function replaceMandatees(connectionOptions) {
  await updateSudo(
    `
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
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
        ?versionedMember a mandaat:Mandataris .
        ?versionedMember ?pNew ?oNew .
        ?versionedMember org:holds ?mandaat .
        ?versionedMember ext:owningBestuurseenheid ?bestuurseenheid.
        FILTER (?pNew NOT IN ( ${sparqlEscapeUri(
          VERSION_PREDICATE
        )}, ${sparqlEscapeUri(TIME_PREDICATE)} ))
      }
      ?mandaat org:hasPost / mandaat:isTijdspecialisatieVan / besluit:bestuurt ?bestuurseenheid .
      ?targetGraph ext:ownedBy ?bestuurseenheid .
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

async function replaceMembership(connectionOptions) {
  await updateSudo(
    `
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
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
        ?versionedMember a org:Membership .
        ?versionedMember ?pNew ?oNew .
        ?versionedMember ext:owningBestuurseenheid ?bestuurseenheid.
        FILTER (?pNew NOT IN ( ${sparqlEscapeUri(
          VERSION_PREDICATE
        )}, ${sparqlEscapeUri(TIME_PREDICATE)} ))
      }
      ?targetGraph ext:ownedBy ?bestuurseenheid .
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

async function replacePeople(connectionOptions) {
  await updateSudo(
    `
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX person: <http://www.w3.org/ns/person#>
    PREFIX adms: <http://www.w3.org/ns/adms#>
    PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
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
          person:Person
          persoon:Geboorte
          adms:Identifier
        }
        ?versionedMember a mandaat:Mandataris .
        ?versionedMember ?pNew ?oNew .
        ?versionedMember ext:owningBestuurseenheid ?bestuurseenheid.
        FILTER (?pNew NOT IN ( ${sparqlEscapeUri(
          VERSION_PREDICATE
        )}, ${sparqlEscapeUri(TIME_PREDICATE)} ))
      }
      ?targetGraph ext:ownedBy ?bestuurseenheid .
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
