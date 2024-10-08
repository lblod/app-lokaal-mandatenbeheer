import { Changeset } from "../types";
import { querySudo } from "@lblod/mu-auth-sudo";
import { sparqlEscapeUri, sparqlEscapeString } from "mu";
import { publishInterestingSubjects } from "./handle-types-util";
import { MANDATARIS_DRAFT_STATE } from "./utils/well-known-uris";
import { InterestingSubject, bindingToTriple } from "./publisher";
import { v4 as uuidv4 } from "uuid";

export const toMandatarisDraftState = async (subjects: string[]) => {
  const matches = await querySudo(`
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
      PREFIX lmb: <http://lblod.data.gift/vocabularies/lmb/>

      SELECT DISTINCT ?s ?publicationStatus
      WHERE {
        GRAPH ?g {
          ?s a mandaat:Mandataris.
          VALUES ?s { ${[...subjects]
            .map((subject) => `<${subject}>`)
            .join(" ")} }
          OPTIONAL { ?s lmb:hasPublicationStatus ?publicationStatus. }
        }
        ?g <http://mu.semte.ch/vocabularies/ext/ownedBy> ?bestuurseenheid.
      }
    `);
  return matches.results.bindings;
};

const keepMandatarisTypesQuery = async (
  subjects: string[]
): Promise<InterestingSubject[]> => {
  const subjectsWithDraftState = await toMandatarisDraftState(subjects);
  return subjectsWithDraftState
    .map((binding) => {
      const isNotDraft =
        binding.publicationStatus?.value !== MANDATARIS_DRAFT_STATE;
      const ldesType = isNotDraft ? "public" : "abb"; // default to non-draft if not present
      return {
        uri: binding.s.value,
        ldesType,
        type: "http://data.vlaanderen.be/ns/mandaat#Mandataris",
      };
    })
    .filter((b) => !!b) as InterestingSubject[];
};

const addTimeInterval = async (
  subject: InterestingSubject
): Promise<string> => {
  const tijdsintervalUuid = uuidv4();
  const tijdsintervalUri = `http://data.lblod.info/id/tijdsintervallen/${tijdsintervalUuid}`;
  const data = await querySudo(`
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX generiek: <https://data.vlaanderen.be/ns/generiek#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    CONSTRUCT {
      ${sparqlEscapeUri(tijdsintervalUri)} a dct:PeriodOfTime ;
        mu:uuid ${sparqlEscapeString(tijdsintervalUuid)} ;
        generiek:begin ?start ;
        generiek:einde ?einde ;
        ext:relatedTo ?bestuurseenheid .
      ?membership org:memberDuring ${sparqlEscapeUri(tijdsintervalUri)} .
    } WHERE {
      GRAPH ?g {
        <${subject.uri}> a mandaat:Mandataris ;
          org:hasMembership ?membership ;
          mandaat:start ?start .
        OPTIONAL {
          <${subject.uri}> mandaat:einde ?einde .
        }
      }
      ?g ext:ownedBy ?bestuurseenheid .
      FILTER NOT EXISTS {
        ?g a <http://mu.semte.ch/vocabularies/ext/FormHistory> .
      }
      FILTER ( ?g != <http://mu.semte.ch/graphs/besluiten-consumed> )
    }
  `);
  return data.results.bindings.map(bindingToTriple).join("\n");
};

export const handleMandatarisType = async (changesets: Changeset[]) => {
  await publishInterestingSubjects(
    changesets,
    keepMandatarisTypesQuery,
    addTimeInterval
  );
};
