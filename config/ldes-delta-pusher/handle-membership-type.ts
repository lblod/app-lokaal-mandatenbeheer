import { Changeset } from "../types";
import { querySudo } from "@lblod/mu-auth-sudo";
import { sparqlEscapeUri, sparqlEscapeString } from "mu";
import { publishInterestingSubjects } from "./handle-types-util";
import { InterestingSubject, bindingToTriple } from "./publisher";
import { v4 as uuidv4 } from "uuid";

const addTimeInterval = async (
  subject: InterestingSubject
): Promise<string> => {
  const tijdsintervalUuid = uuidv4();
  const tijdsintervalUri = `http://data.lblod.info/id/tijdsintervallen/${tijdsintervalUuid}`;
  const data = await querySudo(`
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX generiek: <http://data.vlaanderen.be/ns/generiek#>
    PREFIX generiekS: <https://data.vlaanderen.be/ns/generiek#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    CONSTRUCT {
      ${sparqlEscapeUri(tijdsintervalUri)} a dct:PeriodOfTime ;
        mu:uuid ${sparqlEscapeString(tijdsintervalUuid)} ;
        generiek:begin ?start ;
        generiek:einde ?einde ;
        generiekS:begin ?start ;
        generiekS:einde ?einde ;
        ext:relatedTo ?bestuurseenheid .
      <${subject.uri}> org:memberDuring ${sparqlEscapeUri(tijdsintervalUri)} .
    } WHERE {
      GRAPH ?g {
        ?mandataris a mandaat:Mandataris ;
          org:hasMembership <${subject.uri}> ;
          mandaat:start ?start .
        OPTIONAL {
          <${subject.uri}> mandaat:einde ?einde .
        }
      }
      ?g ext:ownedBy ?bestuurseenheid .
    }
  `);
  return data.results.bindings.map(bindingToTriple).join("\n");
};

const keepMembershipTypesQuery = async (
  subjects: string[]
): Promise<InterestingSubject[]> => {
  const matches = await querySudo(`
      SELECT DISTINCT ?s WHERE {
        GRAPH ?g {
          ?s a <http://www.w3.org/ns/org#Membership> .
        }
        ?g <http://mu.semte.ch/vocabularies/ext/ownedBy> ?bestuurseenheid.

        VALUES ?s { ${[...subjects]
          .map((subject) => `<${subject}>`)
          .join(" ")} }
      }
    `);
  return matches.results.bindings
    .map((binding) => {
      return {
        uri: binding.s.value,
        ldesType: { public: {}, abb: {}, internal: {} },
        type: "http://www.w3.org/ns/org#Membership",
      };
    })
    .filter((b) => !!b);
};

export const handleMembershipType = async (changesets: Changeset[]) => {
  await publishInterestingSubjects(
    changesets,
    keepMembershipTypesQuery,
    addTimeInterval
  );
};
