# Custom sparql queries Advanced

In dit document vind je de nodige informatie voor het creëren van een widget met mandataris informatie dat gebaseerd is op de **Vlaamse Madatendatabank**. Een overzicht van hoe deze informatie is opgebouwd kan [hier](https://data.vlaanderen.be/doc/applicatieprofiel/mandatendatabank/#overview) vinden.

## SPARQL endpoint

De data wordt opgehaald door gebruik te maken van het sparql endpoint van [**Centrale Vindplaats**](https://centrale-vindplaats.lblod.info/sparql). De link naar dit endpoint kan je steeds terugvinden in de [Links](#links) onderaan in dit document.

### Hoe navigeren door de data

#### Meerdere Mandatarissen ophalen

Om te weten hoe zo een mandataris er uit ziet halen we eerst 5 mandatarissen op. Dit doe je door volgende query te kopieren in het sparql endpoint van **Centrale Vindplaats**.

⚠️ Let op als je subjects opvraagt per type, weet dat die er mogelijks als een groot aantal inzitten en gebruik dus de LIMIT om de query niet te zwaar te maken.

```sparql
PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>

SELECT * WHERE {
  ?mandataris a mandaat:Mandataris .
} LIMIT 5
```

Onderstaande waarden zijn een mogelijk resultaat van onze query. ⚠️ Deze resultaten kunnen verschillen ⚠️

|     | mandataris                                                         |
| --- | ------------------------------------------------------------------ |
| 1   | <http://data.lblod.info/id/mandatarissen/614089E2E5754600080000B6> |
| 2   | <http://data.lblod.info/id/mandatarissen/6141A0CDE575460008000137> |
| 3   | <http://data.lblod.info/id/mandatarissen/6141A4FFE57546000800014A> |
| 4   | <http://data.lblod.info/id/mandatarissen/6141BC08E57546000800018A> |
| 5   | <http://data.lblod.info/id/mandatarissen/6142EE5CE575460008000227> |

Als het goed is krijg je 5 resultaten terug. Deze resultaten zijn de `subjects` (uri's) van de mandatarissen. Om meer informatie te weten te komen kan je de waarde tussen de driehoekige haken gebruiken (URI).

#### Specifieke Mandataris ophalen aan de hand van zijn URI

Ons eerste resultaat is de mandataris met URI gelijk aan **http://data.lblod.info/id/mandatarissen/614089E2E5754600080000B6**. Om meer informatie te weten te komen over deze mandataris kan je doorklikken op deze URI. Nu krijg je al de eigenschappen en relaties te zien in een tabel van deze mandataris.

Om deze informatie op te halen via ons endpoint kan je gebruik maken van volgende query.

```sparql
SELECT * WHERE {
  <http://data.lblod.info/id/mandatarissen/614089E2E5754600080000B6> ?eigenschap ?waarde .
}
```

Resultaat van onze query

|     | Eigenschap                                                    | Waarde                                                                                                |
| --- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>             | <http://data.vlaanderen.be/ns/mandaat#Mandataris>                                                     |
| 2   | <http://www.w3.org/ns/org#hasMembership>                      | <http://data.lblod.info/id/lidmaatschappen/614089E2E5754600080000B5>                                  |
| 3   | <http://mu.semte.ch/vocabularies/core/uuid>                   | 614089E2E5754600080000B6                                                                              |
| 4   | <http://www.w3.org/ns/org#holds>                              | <http://data.lblod.info/id/mandaten/ba7c70d31c2c0cb81a6e6177e7f4ddc5fc8849e9bda4d92f44ba27fe326b65e7> |
| 5   | <http://data.vlaanderen.be/ns/mandaat#einde>                  | "2021-12-31T00:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>                                   |
| 6   | <http://data.vlaanderen.be/ns/mandaat#isBestuurlijkeAliasVan> | <http://data.lblod.info/id/personen/a5c99c224d1e9e2ea86a1598a9a9b3fbdfa14894e460499ac0fc11a6846737a7> |
| 7   | <http://data.vlaanderen.be/ns/mandaat#start>                  | "2021-06-25T00:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>                                   |
| 8   | <http://data.vlaanderen.be/ns/mandaat#status>                 | <http://data.vlaanderen.be/id/concept/MandatarisStatusCode/c301248f-0199-45ca-b3e5-4c596731d5fe>      |

Vergelijk de terug gekregen resultaten met de waarden die je daarnet in de tabel zag. Elke `?eigenschap` vind je ook hier terug met zijn overkomstige `?waarde`. Zo zien je dat de **Mandataris** een start en eind datum heeft maar ook een nog andere eigenschappen. Om meer informatie over elke eigenschap te weten te komen kan je telkens doorklikken op de URI. Die verwijzen meestal naar een leesbare pagina waar de eigenschap uitgelegd staat maar kan ook verwijzen naar een turtle bestand dat iets moeilijker te lezen is.

#### Een eigenschap specifieke eigennschap ophalen van een Mandataris

Onze vorige query gaf als resultaat al zijn eigenschappen terug. Als je niet al zijn eigenschappen willen terug krijgen maar één dan kan je gebruik maken van de URI van die eigenschap. Neem als bijvoorbeeld de start datum van de Mandataris, dit kan je terugkrijgen door de URI (http://data.vlaanderen.be/ns/mandaat#start) uit voorgaand resultaat te gebruiken. De query zal er als volgt uitzien.

```sparql
SELECT * WHERE {
  <http://data.lblod.info/id/mandatarissen/614089E2E5754600080000B6> <http://data.vlaanderen.be/ns/mandaat#start> ?waarde .
}
```

Het resultaat van onze query is de start datum. Dit is een string met als datatype `dateTime`.

|     | Waarde                                                              |
| --- | ------------------------------------------------------------------- |
| 1   | "2021-06-25T00:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> |

#### Een eigenschap met als waarde een andere URI

Bij het terugkrijgen van woorden (string) of getallen (integere/decimalen) is het tonen van de waarde duidelijk. Als de `?waarde` van een `?eigenschap` gelijk is aan een andere URI ga je nog een extra query moeten uitvoeren tot er op de gewenste waarde wordt uigekomen. Het resultaat van in [Specifieke Mandataris ophalen aan de hand van zijn URI](#specifieke-mandataris-ophalen-aan-de-hand-van-zijn-uri) geeft ons een `?eigenschap` terug waar dit het geval is. Hieronder zie je het dit aangepakt kan worden.

Bij een `?eigenschap` met uri http://www.w3.org/ns/org#hasMembership kan je zien dat de `?waarde` gelijk is aan een URI. Deze URI kan je zien als een nieuw `subject` waar je informatie van kan ophalen. Dit doe je door zoals in [Specifieke Mandataris ophalen aan de hand van zijn URI](#specifieke-mandataris-ophalen-aan-de-hand-van-zijn-uri) de uri voorop te stellen in onze query en daarvan al de eigenschappen en hun `?waarde` op te vragen.

```sparql
SELECT * WHERE {
  <http://data.lblod.info/id/lidmaatschappen/614089E2E5754600080000B5> ?eigenschap ?waarde .
}
```

Dit geeft als resultaat de eigenschappen van ons `?lidmaatschap`. Lidmaatschap wordt gebruikt als variabele doordat je kijkt naar het woord `lidmaatschappen` voor de uuid. Dit lidmaatschap heeft ook weer een type, uuid en organistatie `?eigenschap` die elks een `?waarde` hebben.

|     | Eigenschap                                        | Waarde                                                        |
| --- | ------------------------------------------------- | ------------------------------------------------------------- |
| 1   | <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> | <http://www.w3.org/ns/org#Membership>                         |
| 2   | <http://mu.semte.ch/vocabularies/core/uuid>       | 614089E2E5754600080000B5                                      |
| 3   | <http://www.w3.org/ns/org#organisation>           | <http://data.lblod.info/id/fracties/5E8F615FA3ACB60008000AD4> |

Bioj het ophalen van de informatie over de `organistatie` krijgen je volgende eigeschappen terug die je kan vinden door op de URI = https://data.lblod.info/id/fracties/5E8F615FA3ACB60008000AD4 (`?waarde`) door te klikken of weer een query te maken met de `?waarde` als `subject`.

```sparql
SELECT * WHERE {
  <http://data.lblod.info/id/fracties/5E8F615FA3ACB60008000AD4> ?eigenschap ?waarde .
}
```

|     | Eigenschap                                        | Waarde                                                                                                        |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> | <http://data.vlaanderen.be/ns/mandaat#Fractie>                                                                |
| 2   | <https://www.w3.org/ns/regorg#legalName>          | Een partij naam                                                                                               |
| 3   | <http://www.w3.org/ns/org#linkedTo>               | <http://data.lblod.info/id/bestuurseenheden/a9e63c13a602de3cc5463cc81eee0b8d80d14a1846d1deb82b3a2d4e7efc96af> |
| 4   | <http://www.w3.org/ns/org#memberOf>               | <http://data.lblod.info/id/bestuursorganen/508ba1f646df60ccca50d66dae56d5b2790436c0c23c0bf8019b647fd6e83a0c>  |
| 5   | <http://www.w3.org/ns/org#memberOf>               | <http://data.lblod.info/id/bestuursorganen/8889822dcf84932bd7f48726cdc726e5da586f9829fb7bc14605ebc496c9af97>  |
| 6   | <http://www.w3.org/ns/org#memberOf>               | <http://data.lblod.info/id/bestuursorganen/e775fec5a58ec771f0ceb818545e127a404919173957e71eb74717dc73195971>  |
| 7   | <http://mu.semte.ch/vocabularies/core/uuid>       | 5E8F615FA3ACB60008000AD4                                                                                      |

Had je nu graag de waarde van één van de eigenschappen getoond vervang je de variabele `?eigenschap` door de URI die de eigenschap representeerd.

```sparql
SELECT * WHERE {
  <http://data.lblod.info/id/fracties/5E8F615FA3ACB60008000AD4> <https://www.w3.org/ns/regorg#legalName> ?waarde .
}
```

Bij dit voorbeeld verkrijg je dan `Een partij naam` terug als `?waarde`.

### Verkrijgen van data voor een widget

#### Lijst van mandatarissen

Hierboven heb je gekeken hoe meerdere mandatarissen kunnen opgehaald worden aan de hand van een query. Daarna heb je gezien hoe specifieke eigenschappen op te vragen van één mandataris. Bij volgende query combineren we beide zodat je een lijst kan tonen van mandatarissen die bepaalde basis informatie meegeeft over elke mandataris.

```sparql
PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX org: <http://www.w3.org/ns/org#>
PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
PREFIX regorg: <https://www.w3.org/ns/regorg#>

SELECT (?mandaatLabel AS ?mandaat) ?fractie ?voornaam ?familienaam ?status (GROUP_CONCAT(?beleidsdomein; separator=", ") as ?bevoegdheden) (?startdatum AS ?start) (?einddatum AS ?einde) WHERE {
  ?mandataris a mandaat:Mandataris .
  ?mandataris mandaat:start ?startdatum .
  ?mandataris mandaat:einde ?einddatum .

  ?mandataris mandaat:status ?mandatarisStatusCode .
  ?mandatarisStatusCode skos:prefLabel ?status .

  ?mandataris org:holds ?mandaat .
  ?mandaat  org:role ?bestuursfunctieCode.
  ?bestuursfunctieCode skos:prefLabel ?mandaatLabel .

  ?mandataris org:hasMembership ?lidmaatschap .
  ?lidmaatschap org:organisation ?organisation .
  ?organisation regorg:legalName ?fractie .

  ?mandataris mandaat:isBestuurlijkeAliasVan ?persoon .
  ?persoon persoon:gebruikteVoornaam ?voornaam .
  ?persoon foaf:familyName ?familienaam .

  ?mandataris mandaat:beleidsdomein ?beleidsdomeinen .
  ?beleidsdomeinen skos:prefLabel ?beleidsdomein .
}
GROUP BY ?mandaatLabel ?fractie ?voornaam ?familienaam ?status ?startdatum ?einddatum
```

#### Mandataris tonen

Door bovenstaande informatie te gebruiken kan je een lijst van mandatarissen te tonen. Natuurlijk wil je ook graag deze informatie tonen voor een specifieke mandataris. bv na het doorklikken op de mandataris in de lijst.

BIj de query zijn er een aantal verschillen dan bij het ophalen van al de mandatarissen.

1. Specifieer welke URI onze `?mandataris` heeft
2. Er worden twee `?eigenschappen` meer opgevraagd waaronder de `?locatie` en het `?orgaan`
3. Beide variable worden ook toegevoegd aan de `GROUP BY`

```sparql
PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX org: <http://www.w3.org/ns/org#>
PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
PREFIX regorg: <https://www.w3.org/ns/regorg#>

SELECT (?bestuurdIn AS ?locatie) (?bestuursOrgaanInTijdLabel AS ?orgaan) (?mandaatLabel AS ?mandaat) ?fractie ?voornaam ?familienaam ?status (GROUP_CONCAT(?beleidsdomein; separator=", ") as ?bevoegdheden) (?startdatum AS ?start) (?einddatum AS ?einde) WHERE {
  VALUES ?mandataris { <http://data.lblod.info/id/mandatarissen/bb318931-b2bb-446b-b87c-e4f706f57e7f> }

  ?mandataris mandaat:start ?startdatum .
  ?mandataris mandaat:einde ?einddatum .

  ?mandataris mandaat:status ?mandatarisStatusCode .
  ?mandatarisStatusCode skos:prefLabel ?status .

  ?mandataris org:holds ?mandaat .
  ?mandaat  org:role ?bestuursfunctieCode.
  ?bestuursfunctieCode skos:prefLabel ?mandaatLabel .
  ?mandaat ^org:hasPost ?bestuursorgaan .
  ?bestuursorgaan mandaat:isTijdspecialisatieVan ?bestuursOrgaanInTijd .
  ?bestuursOrgaanInTijd skos:prefLabel ?bestuursOrgaanInTijdLabel .
  ?bestuursOrgaanInTijd besluit:bestuurt ?bestuurd .
  ?bestuurd skos:prefLabel ?bestuurdIn .

  ?mandataris org:hasMembership ?lidmaatschap .
  ?lidmaatschap org:organisation ?organisation .
  ?organisation regorg:legalName ?fractie .

  ?mandataris mandaat:isBestuurlijkeAliasVan ?persoon .
  ?persoon persoon:gebruikteVoornaam ?voornaam .
  ?persoon foaf:familyName ?familienaam .

  ?mandataris mandaat:beleidsdomein ?beleidsdomeinen .
  ?beleidsdomeinen skos:prefLabel ?beleidsdomein .
}
GROUP BY ?bestuurdIn ?bestuursOrgaanInTijdLabel ?mandaatLabel ?fractie ?voornaam ?familienaam ?status ?startdatum ?einddatum
```

Deze query geeft daarbij als resultaat

| Locatie  | Orgaan                                         | Mandaat | Fractie | Voornaam | Familienaam | Status    | Bevoegdheden          | Start                                                               | Einde                                                               |
| -------- | ---------------------------------------------- | ------- | ------- | -------- | ----------- | --------- | --------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Borgloon | College van Burgemeester en Schepenen Borgloon | Schepen | sp.a    | Jo       | Dardenne    | Effectief | Woon- en leefomgeving | "2019-01-02T23:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> | "2020-12-30T23:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> |

## Links

- Centrale Vindplaats sparql endpoint | https://centrale-vindplaats.lblod.info/sparql
