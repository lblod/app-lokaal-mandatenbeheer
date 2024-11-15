const PREFIXES = `
PREFIX adms: <http://www.w3.org/ns/adms#>
PREFIX adres: <https://data.vlaanderen.be/ns/adres#>
PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
PREFIX ch: <http://data.lblod.info/vocabularies/contacthub/>
PREFIX code: <http://lblod.data.gift/vocabularies/organisatie/>
PREFIX dbpedia: <http://dbpedia.org/ontology/>
PREFIX dc_terms: <http://purl.org/dc/terms/>
PREFIX ere: <http://data.lblod.info/vocabularies/erediensten/>
PREFIX euro: <http://data.europa.eu/m8g/>
PREFIX euvoc: <http://publications.europa.eu/ontology/euvoc#>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX generiek: <https://data.vlaanderen.be/ns/generiek#>
PREFIX lblodlg: <https://data.lblod.info/vocabularies/leidinggevenden/>
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX org: <http://www.w3.org/ns/org#>
PREFIX organisatie: <https://data.vlaanderen.be/ns/organisatie#>
PREFIX person: <http://www.w3.org/ns/person#>
PREFIX persoon: <https://data.vlaanderen.be/ns/persoon#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX regorg: <http://www.w3.org/ns/regorg#>
PREFIX schema: <http://schema.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>`;

const contextConfig = {
  addTypes: {
    scope: "none", // 'inserts, 'deletes', 'all' or none. To add rdf:type to subjects of inserts, deletes or both
    exhausitive: false, // true or false: find all types for a subject, even if one is already present in delta
  },
  contextQueries: [],
};

module.exports = {
  contextConfig,
  PREFIXES,
};
