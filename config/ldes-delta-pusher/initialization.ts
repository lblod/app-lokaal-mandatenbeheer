const regularTypes = {
  "http://data.vlaanderen.be/ns/mandaat#Fractie": "public",
  "http://www.w3.org/ns/org#Membership": "public",
  "http://data.vlaanderen.be/ns/mandaat#Mandaat": "public",
  "http://www.w3.org/ns/person#Person": "public",
  "http://purl.org/dc/terms/PeriodOfTime": "public",
  "http://www.w3.org/ns/adms#Identifier": "abb",
  "http://data.vlaanderen.be/ns/persoon#Geboorte": "abb",
  "http://schema.org/ContactPoint": "abb",
  "http://www.w3.org/ns/locn#Address": "abb",
};

export const initialization = {
  public: {
    "http://data.vlaanderen.be/ns/mandaat#Mandataris": {
      filter: `
        OPTIONAL { ?s <http://mu.semte.ch/vocabularies/ext/lmb/hasPublicationStatus> ?publicationStatus. }
        FILTER(!BOUND(?publicationStatus) || ?publicationStatus != <http://data.lblod.info/id/concept/MandatarisPublicationStatusCode/588ce330-4abb-4448-9776-a17d9305df07>)`,
    },
  },
  abb: {
    // meaning there is no filter
    "http://data.vlaanderen.be/ns/mandaat#Mandataris": {},
  },
  internal: {
    "http://data.vlaanderen.be/ns/mandaat#Mandataris": {},
  },
};

Object.keys(regularTypes).forEach((type) => {
  const level = regularTypes[type];
  if (level === "public") {
    initialization.public[type] = {};
    initialization.abb[type] = {};
    initialization.internal[type] = {};
  } else if (level === "abb") {
    initialization.abb[type] = {};
    initialization.internal[type] = {};
  } else if (level === "internal") {
    initialization.internal[type] = {};
  }
});
