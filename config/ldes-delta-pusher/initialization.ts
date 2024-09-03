const regularTypes = {
  "http://data.vlaanderen.be/ns/mandaat#Fractie": "public",
  "http://www.w3.org/ns/org#Membership": "public",
  "http://data.vlaanderen.be/ns/mandaat#Mandaat": "public",
  "http://purl.org/dc/terms/PeriodOfTime": "public",
  "http://www.w3.org/ns/adms#Identifier": "abb",
  "http://data.vlaanderen.be/ns/persoon#Geboorte": "abb",
};

// this is so we can relate our instances to the bestuurseenheid they concern
const extraConstruct = `
  ?versionedS <http://mu.semte.ch/vocabularies/ext/relatedTo> ?bestuurseenheid.
`;
const extraWhere = `
  GRAPH ?g {
    ?s a ?thing.
  }
  GRAPH <http://mu.semte.ch/graphs/public> {
    ?g <http://mu.semte.ch/vocabularies/ext/ownedBy> ?bestuurseenheid.
  }
`;

export const initialization = {
  public: {
    "http://data.vlaanderen.be/ns/mandaat#Mandataris": {
      filter: `
        OPTIONAL { ?s <http://mu.semte.ch/vocabularies/ext/lmb/hasPublicationStatus> ?publicationStatus. }
        FILTER(!BOUND(?publicationStatus) || ?publicationStatus != <http://data.lblod.info/id/concept/MandatarisPublicationStatusCode/588ce330-4abb-4448-9776-a17d9305df07>)`,
      extraConstruct,
      extraWhere,
    },
    "http://www.w3.org/ns/person#Person": {
      filter: `FILTER(?p NOT IN (<http://data.vlaanderen.be/ns/persoon#heeftGeboorte>, <http://www.w3.org/ns/adms#identifier>, <http://data.vlaanderen.be/ns/persoon#geslacht>))
      `,
      extraConstruct,
      extraWhere,
    },
  },
  abb: {
    // meaning there is no filter
    "http://data.vlaanderen.be/ns/mandaat#Mandataris": {
      extraConstruct,
      extraWhere,
    },
    "http://www.w3.org/ns/person#Person": {
      extraConstruct,
      extraWhere,
    },
  },
  internal: {
    "http://data.vlaanderen.be/ns/mandaat#Mandataris": {
      extraConstruct,
      extraWhere,
    },
    "http://www.w3.org/ns/person#Person": {
      extraConstruct,
      extraWhere,
    },
  },
};

Object.keys(regularTypes).forEach((type) => {
  const level = regularTypes[type];
  const defaultConfig = {
    extraConstruct,
    extraWhere,
  };
  if (level === "public") {
    initialization.public[type] = defaultConfig;
    initialization.abb[type] = defaultConfig;
    initialization.internal[type] = defaultConfig;
  } else if (level === "abb") {
    initialization.abb[type] = defaultConfig;
    initialization.internal[type] = defaultConfig;
  } else if (level === "internal") {
    initialization.internal[type] = defaultConfig;
  }
});
