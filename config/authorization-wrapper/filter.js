import * as mu from "mu";
import * as mas from "@lblod/mu-auth-sudo";

export async function isBasicAuthorized(user, key, _req) {
  const checkLoginQuery = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX muAccount: <http://mu.semte.ch/vocabularies/account/>
    PREFIX wotSec: <https://www.w3.org/2019/wot/security#>
    PREFIX lblodAuth: <http://lblod.data.gift/vocabularies/authentication/>
    PREFIX pav: <http://purl.org/pav/>
    PREFIX session: <http://mu.semte.ch/vocabularies/session/>
    PREFIX oslc: <http://open-services.net/ns/core#>
    PREFIX dct: <http://purl.org/dc/terms/>
    SELECT DISTINCT ?organizationID WHERE  {
      ${mu.sparqlEscapeUri(user)}
        a foaf:Agent;
        muAccount:key ${mu.sparqlEscapeString(key)};
        muAccount:canActOnBehalfOf <http://mu.semte.ch/vocabularies/ext/abb>.
    }
  `;
  const response = await mas.querySudo(checkLoginQuery);
  const exists = response.results?.bindings?.length > 0;
  return exists;
}

export async function isAuthorized(sessionUri) {
  const checkSessionQuery = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX muAccount: <http://mu.semte.ch/vocabularies/account/>
    PREFIX wotSec: <https://www.w3.org/2019/wot/security#>
    PREFIX lblodAuth: <http://lblod.data.gift/vocabularies/authentication/>
    PREFIX pav: <http://purl.org/pav/>
    PREFIX session: <http://mu.semte.ch/vocabularies/session/>
    PREFIX oslc: <http://open-services.net/ns/core#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    SELECT ?uuid ?created ?account {
      GRAPH ?g {
        ${mu.sparqlEscapeUri(sessionUri)}
          a session:Session ;
          mu:uuid ?uuid ;
          dct:created ?created ;
          muAccount:account ?account ;
          muAccount:canActOnBehalfOf ext:abb .
      }
    } LIMIT 2
  `;
  const response = await mas.querySudo(checkSessionQuery);
  // We want exactly one result, only one session should exist at a certain time.
  const exists = response.results?.bindings?.length === 1;
  return exists;
}
