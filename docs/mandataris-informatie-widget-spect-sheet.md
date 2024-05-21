# Widget met informatie van de Vlaamse Mandatendatabank

In dit document vind je de nodige informatie voor het creëren van een widget met mandataris informatie dat gebaseerd is op de **Vlaamse Madatendatabank**. Een overzicht van hoe deze informatie is opgebouwd kan [hier](https://data.vlaanderen.be/doc/applicatieprofiel/mandatendatabank/#overview) vinden. Onze data gaan we ophalen door gebruik te maken van het publieke endpoint van de **Centrale Vindplaats**.

## SPARQL endpoint

Onze data gaan we ophalen door gebruik te maken van het sparql endpoint van [**Centrale Vindplaats**](https://centrale-vindplaats.lblod.info/sparql). De link naar dit endpoint kan je steeds terugvinden in de [Links](#links) onderaan in dit document.

### Hoe ziet een mandataris er uit

#### Meerdere Mandatarissen ophalen

Om te weten hoe zo een mandataris er uit ziet halen we eerst 5 mandatarissen op. Dit doen we door volgende query kopieren in ons sparql endpoint van **Centrale Vindplaats**.

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

Als het goed is krijg je 5 resultaten terug. Deze resultaten zijn de `subjects` (uri's) van de mandatarissen. Als we meer informatie willen weten over een van deze kunnen we de waarde tussen de driehoekige haken gebruiken (URI).

#### Specifieke Mandataris ophalen aan de hand van zijn URI

Ons eerste resultaat is de mandataris met URI gelijk aan **http://data.lblod.info/id/mandatarissen/614089E2E5754600080000B6**. Om meer informatie te weten te komen over deze mandataris kunnen we doorklikken op deze URI. Nu krijg je al de eigenschappen en relaties te zien in een tabel van deze mandataris.

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

Vergelijk de terug gekregen resultaten met de waarden die je daarnet in de tabel zag. Elke `?eigenschap` vind je ook hier terug met zijn overkomstige `?waarde`. Zo zien we dat onze **Mandataris** een start en eind datum heeft maar ook een nog andere eigenschappen. Om meer informatie over elke eigenschap te weten te komen kunnen we telkens doorklikken op de URI. Die verwijzen meestal naar een leesbare pagina waar de eigenschap uitgelegd staat maar kan ook verwijzen naar een turtle bestand dat iets moeilijker te lezen is.

#### Een eigenschap specifieke eigennschap ophalen van een Mandataris

Onze vorige query gaf als resultaat al zijn eigenschappen terug. Als we niet al zijn eigenschappen willen terug krijgen maar één dan kunnen we gebruik maken van de URI van die eigenschap. Als we bijvoorbeeld de start datum van de Mandataris willen terugkrijgen kunnen we de URI (http://data.vlaanderen.be/ns/mandaat#start) uit voorgaand resultaat gebruiken om dit op te vragen. De query zal er als volgt uitzien.

```sparql
SELECT * WHERE {
  <http://data.lblod.info/id/mandatarissen/614089E2E5754600080000B6> <http://data.vlaanderen.be/ns/mandaat#start> ?waarde .
}
```

Het resultaat van onze query is de start datum. Dit is een string met als datatype `dateTime`.

|     | Waarde                                                              |
| --- | ------------------------------------------------------------------- |
| 1   | "2021-06-25T00:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> |

## Links

- Centrale Vindplaats sparql endpoint | https://centrale-vindplaats.lblod.info/sparql
