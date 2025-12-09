import { logger } from "../logger";
import { updateSudo } from "@lblod/mu-auth-sudo";
import { sparqlEscapeUri } from "mu";
import {
  BATCH_GRAPH,
  VERSION_PREDICATE,
  TIME_PREDICATE,
  TARGET_GRAPH,
} from "../environment";

/**
 * NOTE
 * This service runs on the locally installed LMB application at the customer site.
 *
 * In the **normal flow**, Kalliope pushes the new "burgemeester-benoeming" (mayor) to our **central** LMB application, which then creates the mayor mandate (**mandataris**) and validates/confirms it (**bekrachtigt**).
 *
 * Since this is a **local** instance of our application, we cannot ask Kalliope to push the data to all locally managed instances. Therefore, we add this ldes-client service to the app.
 *
 * This client service will **fetch** all **validated/confirmed** ("bekrachtigde") mayor mandates from our **central** LMB LDES stream.
 *
 * The service focuses on mandates (**mandatarissen**) that are **not yet known** in the locally managed instance. This ensures that when a new mayor mandate is validated (**bekrachtigd**), it flows from the central LMB to the locally managed instance **only once**.
 *
 * If this mandate is later changed in the local instance and flows back to central LMB, we don't need to worry about it flowing right back. Since the local instance now **knows** the mandate, it will not be added or updated again by this service.
 */
const GEMEENTE_BESTUURSEENHEID_URI = process.env.GEMEENTE_BESTUURSEENHEID_URI || "http://data.lblod.info/id/bestuurseenheden/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4"; // Gemeente Aalst
export async function processPage() {
  logger.debug("Running custom logic to process the current page");

  const burgemeesterOrgaanClassificatieCodeUri = 'http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/4955bd72cd0e4eb895fdbfab08da0284';
  const bekrachtigdPublicatieCodeUri = 'https://data.lblod.info/id/concept/MandatarisPublicationStatusCode/9d8fd14d-95d0-4f5e-b3a5-a56a126227b6';
  await updateSudo(`
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX lmb: <http://lblod.data.gift/vocabularies/lmb/>
    INSERT {
      GRAPH ?organizationG {
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
      ?organizationG ext:ownedBy ?bestuurseenheid .
    }`);
};
