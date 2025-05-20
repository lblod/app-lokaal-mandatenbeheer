import { logger } from "../logger";
import { updateSudo } from "@lblod/mu-auth-sudo";
import { sparqlEscapeUri } from "mu";
import {
  BATCH_GRAPH,
  BYPASS_MU_AUTH,
  DIRECT_DATABASE_CONNECTION,
  environment,
} from "../environment";

async function replaceExistingData() {
  let options = {};
  if (BYPASS_MU_AUTH) {
    console.log(">>>>> bypassing mu-auth");
    options = {
      sparqlEndpoint: DIRECT_DATABASE_CONNECTION,
    };
  }
  const env = {
    VERSION_PREDICATE: environment.getVersionPredicate(),
    TIME_PREDICATE: environment.getTimePredicate(),
    CURRENT_STREAM_NAME: environment.getCurrentStreamConfig().name,
  };
  console.log("handling page for stream ", env.CURRENT_STREAM_NAME);
  await replaceFracties(options, env);
  await replaceMandatees(options, env);
  await replaceMembership(options, env);
  await replacePeople(options, env);
  // TODO add tombstones
}

async function replaceFracties(connectionOptions, env) {
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
        ?versionedMember ${sparqlEscapeUri(env.VERSION_PREDICATE)} ?s .
        ?versionedMember a mandaat:Fractie .
        ?versionedMember ?pNew ?oNew .
        ?versionedMember org:linkedTo ?bestuurseenheid .
        ?versionedMember ext:owningBestuurseenheid | <http://mu.semte.ch/vocabularies/ext/relatedTo> ?bestuurseenheid .
        FILTER (?pNew NOT IN ( ${sparqlEscapeUri(
          env.VERSION_PREDICATE
        )}, ${sparqlEscapeUri(env.TIME_PREDICATE)} ))
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

async function replaceMandatees(connectionOptions, env) {
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
        ?versionedMember ${sparqlEscapeUri(env.VERSION_PREDICATE)} ?s .
        ?versionedMember a mandaat:Mandataris .
        ?versionedMember ?pNew ?oNew .
        ?versionedMember org:holds ?mandaat .
        ?versionedMember ext:owningBestuurseenheid | <http://mu.semte.ch/vocabularies/ext/relatedTo> ?bestuurseenheid.
        FILTER (?pNew NOT IN ( ${sparqlEscapeUri(
          env.VERSION_PREDICATE
        )}, ${sparqlEscapeUri(env.TIME_PREDICATE)} ))
      }
      ?mandaat ^org:hasPost / mandaat:isTijdspecialisatieVan / besluit:bestuurt ?bestuurseenheid .
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

async function replaceMembership(connectionOptions, env) {
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
        ?versionedMember ${sparqlEscapeUri(env.VERSION_PREDICATE)} ?s .
        ?versionedMember a org:Membership .
        ?versionedMember ?pNew ?oNew .
        ?versionedMember ext:owningBestuurseenheid | <http://mu.semte.ch/vocabularies/ext/relatedTo> ?bestuurseenheid.
        FILTER (?pNew NOT IN ( ${sparqlEscapeUri(
          env.VERSION_PREDICATE
        )}, ${sparqlEscapeUri(env.TIME_PREDICATE)} ))
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

async function replacePeople(connectionOptions, env) {
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
        ?versionedMember ${sparqlEscapeUri(env.VERSION_PREDICATE)} ?s .
        VALUES ?type {
          person:Person
          persoon:Geboorte
          adms:Identifier
        }
        ?versionedMember a ?type .
        ?versionedMember ?pNew ?oNew .
        ?versionedMember ext:owningBestuurseenheid | <http://mu.semte.ch/vocabularies/ext/relatedTo> ?bestuurseenheid.
        FILTER (?pNew NOT IN ( ${sparqlEscapeUri(
          env.VERSION_PREDICATE
        )}, ${sparqlEscapeUri(env.TIME_PREDICATE)} ))
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
