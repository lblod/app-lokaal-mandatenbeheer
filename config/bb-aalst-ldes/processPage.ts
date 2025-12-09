import { logger } from "../logger";
import { updateSudo } from "@lblod/mu-auth-sudo";
import { sparqlEscapeUri } from "mu";
import {
  BATCH_GRAPH,
  BYPASS_MU_AUTH,
  DIRECT_DATABASE_CONNECTION,
  VERSION_PREDICATE,
  TIME_PREDICATE,
  TARGET_GRAPH,
} from "../environment";

const GEMEENTE_BESTUURSEENHEID_URI = process.env.GEMEENTE_BESTUURSEENHEID_URI || "http://data.lblod.info/id/bestuurseenheden/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4"; // Gemeente Aalst

export async function processPage() {
  const burgemeesterOrgaanClassificatieCodeUri = 'http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/4955bd72cd0e4eb895fdbfab08da0284';
  const bekrachtigdPublicatieCodeUri = 'https://data.lblod.info/id/concept/MandatarisPublicationStatusCode/9d8fd14d-95d0-4f5e-b3a5-a56a126227b6';
  await updateSudo(`
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX lmb: <http://lblod.data.gift/vocabularies/lmb/>
    DELETE {
      GRAPH ${sparqlEscapeUri(TARGET_GRAPH)} {
        ?s ?pOld ?oOld.
      }
    }
    INSERT {
      GRAPH ${sparqlEscapeUri(TARGET_GRAPH)} {
        ?s ?pNew ?oNew.
      }
    } WHERE {
      VALUES ?bestuurseenheid { ${sparqlEscapeUri(GEMEENTE_BESTUURSEENHEID_URI)} }
      
      ?orgaanIT org:hasPost ?mandaat .
      ?orgaanIT mandaat:isTijdspecialisatieVan ?orgaan .
      ?orgaan besluit:classificatie | org:classification ${sparqlEscapeUri(burgemeesterOrgaanClassificatieCodeUri)} .

      FILTER NOT EXISTS {
        GRAPH ?organizationG {
          ?s a mandaat:Mandataris .
        }
        ?organizationG ext:ownedBy ?bestuurseenheid .
      }

      GRAPH ${sparqlEscapeUri(BATCH_GRAPH)} {
        ?stream <https://w3id.org/tree#member> ?versionedMember .
        ?versionedMember ${sparqlEscapeUri(VERSION_PREDICATE)} ?s .
        ?versionedMember a mandaat:Mandataris .
        ?versionedMember lmb:hasPublicationStatus ${sparqlEscapeUri(bekrachtigdPublicatieCodeUri)} .
        ?versionedMember org:holds ?mandaat .
        ?versionedMember ext:owningBestuurseenheid | ext:relatedTo ?bestuurseenheid .
        ?versionedMember ?pNew ?oNew .
        FILTER (?pNew NOT IN ( ${sparqlEscapeUri(VERSION_PREDICATE)}, ${sparqlEscapeUri(TIME_PREDICATE)} ))
      }
      OPTIONAL {
        GRAPH ${sparqlEscapeUri(TARGET_GRAPH)} {
          ?s ?pOld ?oOld.
        }
      }
    }`);
};
