import { query, sparqlEscapeUri, sparqlEscape } from "mu";
import { LDES_ENDPOINT } from "../config";
import fetch from "node-fetch";
import { log } from "./logger";
export type LDES_TYPE = "public" | "abb" | "internal";
export type InterestingSubject = {
  uri: string;
  type: string;
  ldesType: LDES_TYPE;
};

const fetchSubjectData = async (
  subject: InterestingSubject,
  target: string
) => {
  let predicateLimiter = "";
  if (["abb", "public"].includes(target) && modelProperties[subject.type]) {
    let properties = modelProperties[subject.type];
    properties = properties.concat(defaultProperties);
    predicateLimiter = `
    VALUES ?p {
      ${properties.map((p) => sparqlEscapeUri(p)).join("\n")}
    }`;
  }
  const data = await query(`
    CONSTRUCT {
      <${subject.uri}> ?p ?o .
    } WHERE {
      GRAPH ?g {
        <${subject.uri}> ?p ?o .
      }
      ${predicateLimiter}
      FILTER NOT EXISTS {
        ?g a <http://mu.semte.ch/vocabularies/ext/FormHistory> .
      }
    }
  `);
  return data.results.bindings.map(bindingToTriple).join("\n");
};

async function sendLDESRequest(type: string, body: string, retriesLeft = 3) {
  log(`Sending data to LDES endpoint ${LDES_ENDPOINT}/${type}`, "debug");
  await fetch(`${LDES_ENDPOINT}/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/turtle",
    },
    // xsd prefix is used in the types of the result data, so it needs to be declared.
    body: `@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n${body}`,
  }).catch(async (e) => {
    if (retriesLeft > 0) {
      log(
        `Error sending data to LDES endpoint ${type} (retrying): ${e}`,
        "error"
      );
      sendLDESRequest(type, body, retriesLeft - 1);
    } else {
      log(`Error sending data to LDES endpoint ${type}: ${e}`, "error");
    }
  });
}

const datatypeNames = {
  "http://www.w3.org/2001/XMLSchema#dateTime": "dateTime",
  "http://www.w3.org/2001/XMLSchema#date": "date",
  "http://www.w3.org/2001/XMLSchema#decimal": "decimal",
  "http://www.w3.org/2001/XMLSchema#integer": "int",
  "http://www.w3.org/2001/XMLSchema#float": "float",
  "http://www.w3.org/2001/XMLSchema#boolean": "bool",
};

const defaultProperties = [
  "http://purl.org/dc/terms/modified",
  "http://www.w3.org/2002/07/owl#sameAs",
  "http://mu.semte.ch/vocabularies/core/uuid",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
];
// which properties to share for all our known types on the public and abb stream
const modelProperties = {
  "http://data.vlaanderen.be/ns/mandaat#Fractie": [
    "https://www.w3.org/ns/regorg#legalName",
    "http://www.w3.org/ns/org#memberOf",
    "http://www.w3.org/ns/org#linkedTo",
    "http://mu.semte.ch/vocabularies/ext/isFractietype",
  ],
  "http://www.w3.org/ns/org#Membership": [
    "http://www.w3.org/ns/org#organisation",
    "http://www.w3.org/ns/org#hasMembership",
    "http://www.w3.org/ns/org#memberDuring",
  ],
  "http://data.vlaanderen.be/ns/mandaat#Mandaat": [
    "http://data.vlaanderen.be/ns/mandaat#aantalHouders",
  ],
  "http://www.w3.org/ns/person#Person": [
    "http://xmlns.com/foaf/0.1/familyName",
    "http://xmlns.com/foaf/0.1/name",
    "http://data.vlaanderen.be/ns/persoon#gebruikteVoornaam",
    "http://data.vlaanderen.be/ns/persoon#heeftNationaliteit",
    "http://data.vlaanderen.be/ns/persoon#heeftGeboorte",
    "http://www.w3.org/ns/adms#identifier",
    "http://data.vlaanderen.be/ns/persoon#geslacht",
  ],
  "http://purl.org/dc/terms/PeriodOfTime": [
    "http://data.vlaanderen.be/ns/generiek#begin",
    "http://data.vlaanderen.be/ns/generiek#einde",
  ],
  "http://www.w3.org/ns/adms#Identifier": [
    "http://www.w3.org/2004/02/skos/core#notation",
  ],
  "http://data.vlaanderen.be/ns/persoon#Geboorte": [
    "http://data.vlaanderen.be/ns/persoon#datum",
  ],
  "http://data.vlaanderen.be/ns/mandaat#Mandataris": [
    "http://data.vlaanderen.be/ns/mandaat#rangorde",
    "http://data.vlaanderen.be/ns/mandaat#start",
    "http://data.vlaanderen.be/ns/mandaat#einde",
    "http://mu.semte.ch/vocabularies/ext/datumEedaflegging",
    "http://mu.semte.ch/vocabularies/ext/datumMinistrieelBesluit",
    "http://mu.semte.ch/vocabularies/ext/generatedFrom",
    "http://www.w3.org/2004/02/skos/core#changeNote",
    "http://data.vlaanderen.be/ns/mandaat#isTijdelijkVervangenDoor",
    "http://schema.org/contactPoint",
    "http://data.vlaanderen.be/ns/mandaat#beleidsdomein",
    "http://www.w3.org/ns/org#holds",
    "http://www.w3.org/ns/org#hasMembership",
    "http://data.vlaanderen.be/ns/mandaat#isBestuurlijkeAliasVan",
    "http://data.vlaanderen.be/ns/mandaat#status",
    "http://mu.semte.ch/vocabularies/ext/lmb/hasPublicationStatus",
  ],
  "http://schema.org/ContactPoint": [
    "http://schema.org/email",
    "http://schema.org/faxNumber",
    "http://xmlns.com/foaf/0.1/name",
    "http://xmlns.com/foaf/0.1/firstName",
    "http://xmlns.com/foaf/0.1/familyName",
    "http://xmlns.com/foaf/0.1/page",
    "http://schema.org/telephone",
    "http://schema.org/contactType",
    "http://www.w3.org/ns/locn#address",
    "http://mu.semte.ch/vocabularies/ext/secondaryContactPoint",
  ],
  "http://www.w3.org/ns/locn#Address": [
    "https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer",
    "https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer",
    "http://www.w3.org/ns/locn#thoroughfare",
    "http://www.w3.org/ns/locn#postCode",
    "https://data.vlaanderen.be/ns/adres#gemeentenaam",
    "https://data.vlaanderen.be/ns/adres#land",
    "http://www.w3.org/ns/locn#locatorDesignator",
    "http://www.w3.org/ns/locn#locatorName",
    "http://www.w3.org/ns/locn#poBox",
    "http://www.w3.org/ns/locn#postName",
    "http://www.w3.org/ns/locn#fullAddress",
    "http://data.lblod.info/vocabularies/leidinggevenden/adresRegisterId",
    "https://data.vlaanderen.be/ns/adres#verwijstNaar",
  ],
};

const sparqlEscapeObject = (bindingObject): string => {
  const escapeType = datatypeNames[bindingObject.datatype] || "string";
  return bindingObject.type === "uri"
    ? sparqlEscapeUri(bindingObject.value)
    : sparqlEscape(bindingObject.value, escapeType);
};

const bindingToTriple = (binding) =>
  `${sparqlEscapeUri(binding.s.value)} ${sparqlEscapeUri(
    binding.p.value
  )} ${sparqlEscapeObject(binding.o)} .`;

const streamTargets: Record<LDES_TYPE, string[]> = {
  public: ["public", "abb", "internal"],
  abb: ["abb", "internal"],
  internal: ["internal"],
};

/**
 * Publish the currently known info for the given subject URI to the LDES endpoint of the given type
 * @param ldesType the type of the LDES endpoint to publish to (e.g. "public" or "abb")
 * @param subject the uri of the subject to fetch data for and publish
 */
export const publish = async (subject: InterestingSubject) => {
  const targets = streamTargets[subject.ldesType] || [];
  await Promise.all(
    targets.map(async (target) => {
      const data = await fetchSubjectData(subject, target);
      log(
        `[${target}] Publishing data for subject ${subject.uri}:\n${data}`,
        "debug"
      );
      return sendLDESRequest(target, data).catch((e) => {
        log(
          `Error publishing data for subject ${subject.uri} to LDES endpoint ${subject.ldesType}: ${e}`,
          "error"
        );
      });
    })
  );
};
