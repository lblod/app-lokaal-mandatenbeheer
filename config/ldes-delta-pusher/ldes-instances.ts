export const ldesInstances = {
  public: {
    entities: {
      "http://data.vlaanderen.be/ns/mandaat#Mandataris": {
        specialType: true,
        healingPredicates: [
          "http://purl.org/dc/terms/modified",
          // this is the minimal config, one could also check all predicates per type, something like this,
          // but this feels like we gain little, lose a lot of performance and set ourselves up to make mistakes:
          // "http://data.vlaanderen.be/ns/mandaat#rangorde",
          // "http://data.vlaanderen.be/ns/mandaat#start",
          // "http://data.vlaanderen.be/ns/mandaat#einde",
          // "http://mu.semte.ch/vocabularies/ext/datumEedaflegging",
          // "http://mu.semte.ch/vocabularies/ext/datumMinistrieelBesluit",
          // "http://mu.semte.ch/vocabularies/ext/generatedFrom",
          // "http://www.w3.org/2004/02/skos/core#changeNote",
          // "http://data.vlaanderen.be/ns/mandaat#isTijdelijkVervangenDoor",
          // "http://schema.org/contactPoint",
          // "http://data.vlaanderen.be/ns/mandaat#beleidsdomein",
          // "http://www.w3.org/ns/org#holds",
          // "http://www.w3.org/ns/org#hasMembership",
          // "http://data.vlaanderen.be/ns/mandaat#isBestuurlijkeAliasVan",
          // "http://data.vlaanderen.be/ns/mandaat#status",
          // "http://mu.semte.ch/vocabularies/ext/lmb/hasPublicationStatus",
        ],
        instanceFilter: `OPTIONAL { ?s <http://lblod.data.gift/vocabularies/lmb/hasPublicationStatus> ?publicationStatus. }
        FILTER(!BOUND(?publicationStatus) || ?publicationStatus != <http://data.lblod.info/id/concept/MandatarisPublicationStatusCode/588ce330-4abb-4448-9776-a17d9305df07>)`,
      },
      "http://data.vlaanderen.be/ns/mandaat#Fractie": [
        "http://purl.org/dc/terms/modified",
      ],
      "http://www.w3.org/ns/org#Membership": [
        "http://purl.org/dc/terms/modified",
      ],
      "http://data.vlaanderen.be/ns/mandaat#Mandaat": [
        "http://purl.org/dc/terms/modified",
      ],
      "http://www.w3.org/ns/person#Person": {
        instanceFilter: `FILTER(?p NOT IN (<http://data.vlaanderen.be/ns/persoon#heeftGeboorte>, <http://www.w3.org/ns/adms#identifier>, <http://data.vlaanderen.be/ns/persoon#geslacht>))
      `,
        healingPredicates: ["http://purl.org/dc/terms/modified"],
      },
      "http://purl.org/dc/terms/PeriodOfTime": [
        "http://purl.org/dc/terms/modified",
      ],
      "http://data.vlaanderen.be/ns/besluit#Artikel": {
        specialType: true,
        healingPredicates: [
          // this is the minimal config, one could also check all predicates per type, something like this:
          "http://purl.org/dc/terms/modified",
        ],
      },
      "http://data.vlaanderen.be/ns/besluit#Besluit": {
        specialType: true,
        healingPredicates: [
          // this is the minimal config, one could also check all predicates per type, something like this:
          "http://purl.org/dc/terms/modified",
        ],
      },
      "http://www.w3.org/ns/activitystreams#Tombstone": [
        "http://purl.org/dc/terms/modified",
      ],
    },
    graphsToExclude: ["http://mu.semte.ch/graphs/besluiten-consumed"],
    graphTypesToExclude: ["http://mu.semte.ch/vocabularies/ext/FormHistory"],
  },
  // abb: {
  //   entities: {
  //     "http://data.vlaanderen.be/ns/mandaat#Mandataris": {
  //       specialType: true,
  //       healingPredicates: ["http://purl.org/dc/terms/modified"],
  //     },
  //     "http://data.vlaanderen.be/ns/mandaat#Fractie": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://www.w3.org/ns/org#Membership": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://data.vlaanderen.be/ns/mandaat#Mandaat": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://www.w3.org/ns/person#Person": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://purl.org/dc/terms/PeriodOfTime": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://www.w3.org/ns/adms#Identifier": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://data.vlaanderen.be/ns/persoon#Geboorte": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://data.vlaanderen.be/ns/besluit#Artikel": {
  //       specialType: true,
  //       healingPredicates: [
  //         // this is the minimal config, one could also check all predicates per type, something like this:
  //         "http://purl.org/dc/terms/modified",
  //       ],
  //     },
  //     "http://data.vlaanderen.be/ns/besluit#Besluit": {
  //       specialType: true,
  //       healingPredicates: [
  //         // this is the minimal config, one could also check all predicates per type, something like this:
  //         "http://purl.org/dc/terms/modified",
  //       ],
  //     },
  //     "http://www.w3.org/ns/activitystreams#Tombstone": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //   },
  //   graphsToExclude: ["http://mu.semte.ch/graphs/besluiten-consumed"],
  //   graphTypesToExclude: ["http://mu.semte.ch/vocabularies/ext/FormHistory"],
  // },
  // internal: {
  //   entities: {
  //     "http://data.vlaanderen.be/ns/mandaat#Mandataris": {
  //       specialType: true,
  //       healingPredicates: ["http://purl.org/dc/terms/modified"],
  //     },
  //     "http://data.vlaanderen.be/ns/mandaat#Fractie": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://www.w3.org/ns/org#Membership": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://data.vlaanderen.be/ns/mandaat#Mandaat": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://www.w3.org/ns/person#Person": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://purl.org/dc/terms/PeriodOfTime": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://www.w3.org/ns/adms#Identifier": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://data.vlaanderen.be/ns/persoon#Geboorte": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //     "http://data.vlaanderen.be/ns/besluit#Artikel": {
  //       specialType: true,
  //       healingPredicates: [
  //         // this is the minimal config, one could also check all predicates per type, something like this:
  //         "http://purl.org/dc/terms/modified",
  //       ],
  //     },
  //     "http://data.vlaanderen.be/ns/besluit#Besluit": {
  //       specialType: true,
  //       healingPredicates: [
  //         // this is the minimal config, one could also check all predicates per type, something like this:
  //         "http://purl.org/dc/terms/modified",
  //       ],
  //     },
  //     "http://www.w3.org/ns/activitystreams#Tombstone": [
  //       "http://purl.org/dc/terms/modified",
  //     ],
  //   },
  //   graphsToExclude: ["http://mu.semte.ch/graphs/besluiten-consumed"],
  //   graphTypesToExclude: ["http://mu.semte.ch/vocabularies/ext/FormHistory"],
  // },
};

export const defaultProperties = [
  "http://purl.org/dc/terms/modified",
  "http://www.w3.org/2002/07/owl#sameAs",
  "http://mu.semte.ch/vocabularies/core/uuid",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
];

export const officialPredicates = {
  "http://data.vlaanderen.be/ns/mandaat#Fractie": [
    "https://www.w3.org/ns/regorg#legalName",
    "http://www.w3.org/ns/org#memberOf",
    "http://www.w3.org/ns/org#linkedTo",
    "http://mu.semte.ch/vocabularies/ext/isFractietype",
    "http://mu.semte.ch/vocabularies/ext/geproduceerdDoor",
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
    "http://lblod.data.gift/vocabularies/lmb/hasPublicationStatus",
  ],
  "http://data.vlaanderen.be/ns/besluit#Artikel": [
    "http://data.vlaanderen.be/ns/mandaat#bekrachtigtAanstellingVan",
    "http://data.vlaanderen.be/ns/mandaat#bekrachtigtOntslagVan",
  ],
  "http://data.vlaanderen.be/ns/besluit#Besluit": [
    "http://data.vlaanderen.be/ns/mandaat#bekrachtigtAanstellingVan",
    "http://data.vlaanderen.be/ns/mandaat#bekrachtigtOntslagVan",
  ],
};
