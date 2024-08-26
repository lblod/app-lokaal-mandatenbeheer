import { Changeset } from "../types";

export const interestingTypes = [
  "http://data.vlaanderen.be/ns/mandaat#Mandataris",
  "http://data.vlaanderen.be/ns/mandaat#Fractie",
  "http://data.vlaanderen.be/ns/persoon#Geboorte",
  "http://www.w3.org/ns/org#Membership",
  "http://data.vlaanderen.be/ns/mandaat#Mandaat",
  "http://mu.semte.ch/vocabularies/ext/BeleidsdomeinCode",
  "http://www.w3.org/ns/person#Person",
  "http://purl.org/dc/terms/PeriodOfTime",
  "http://www.w3.org/ns/adms#Identifier",
  "http://data.vlaanderen.be/ns/besluit#Bestuursorgaan",
  "http://lblod.data.gift/vocabularies/lmb/Installatievergadering",
  "http://schema.org/ContactPoint",
  "http://www.w3.org/ns/locn#Address",
];

export const filterModifiedSubjects = "";

export async function filterDeltas(changeSets: Changeset[]) {
  const modifiedPred = "http://purl.org/dc/terms/modified";
  const subjectsWithModified = new Set();

  const trackModifiedSubjects = (quad) => {
    if (quad.predicate.value === modifiedPred) {
      subjectsWithModified.add(quad.subject.value);
    }
  };
  changeSets.map((changeSet) => {
    changeSet.inserts.forEach(trackModifiedSubjects);
    changeSet.deletes.forEach(trackModifiedSubjects);
  });

  const ignoredGraphPrefixes = ["http://mu.semte.ch/graphs/formHistory"];
  const isGoodQuad = (quad) =>
    !subjectsWithModified.has(quad.subject.value) &&
    !ignoredGraphPrefixes.some((prefix) => quad.graph.value.startsWith(prefix));
  return changeSets.map((changeSet) => {
    return {
      inserts: changeSet.inserts.filter(isGoodQuad),
      deletes: changeSet.deletes.filter(isGoodQuad),
    };
  });
}
