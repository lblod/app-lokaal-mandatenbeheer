# Custom sparql queries Basic

In dit document vind je de nodige informatie voor het creëren van een widget met mandataris informatie dat gebaseerd is op de **Vlaamse Madatendatabank**. Een overzicht van hoe deze informatie is opgebouwd kan [hier](https://data.vlaanderen.be/doc/applicatieprofiel/mandatendatabank/#overview) vinden. Onze data gaan we ophalen door gebruik te maken van het publieke endpoint van de **Centrale Vindplaats**.

## SPARQL endpoint

Onze data gaan we ophalen door gebruik te maken van het sparql endpoint van [**Centrale Vindplaats**](https://centrale-vindplaats.lblod.info/sparql). De link naar dit endpoint kan je steeds terugvinden in de [Links](#links) onderaan in dit document.

### Lijst van mandatarissen

Als we een lijst willen tonen van mandatrissen moeten we de basis informatie ophalen zodat we hier verder mee kunnen werken.

#### Basis informatie

- Mandaat
- Fractie
- Voornaam
- Achternaam
- Bevoegdheden
- Status van de mandataris
- Start en einddatum

```js
await fetch("https://centrale-vindplaats.lblod.info/sparql?query=PREFIX%20besluit%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fbesluit%23%3E%0APREFIX%20persoon%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fpersoon%23%3E%0APREFIX%20foaf%3A%20%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E%0APREFIX%20skos%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23%3E%0APREFIX%20org%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Forg%23%3E%0APREFIX%20mandaat%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fmandaat%23%3E%0APREFIX%20regorg%3A%20%3Chttps%3A%2F%2Fwww.w3.org%2Fns%2Fregorg%23%3E%0A%0ASELECT%20(%3FbestuurdIn%20AS%20%3Flocatie)%20(%3FbestuursOrgaanInTijdLabel%20AS%20%3Forgaan)%20(%3FmandaatLabel%20AS%20%3Fmandaat)%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20(GROUP_CONCAT(%3Fbeleidsdomein%3B%20separator%3D%22%2C%20%22)%20as%20%3Fbevoegdheden)%20(%3Fstartdatum%20AS%20%3Fstart)%20(%3Feinddatum%20AS%20%3Feinde)%20WHERE%20%7B%0A%20%20%3Fmandataris%20a%20mandaat%3AMandataris%20.%0A%20%20%3Fmandataris%20mandaat%3Astart%20%3Fstardatumt%20.%0A%20%20%3Fmandataris%20mandaat%3Aeinde%20%3Feinddatum%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Astatus%20%3FmandatarisStatusCode%20.%0A%20%20%3FmandatarisStatusCode%20skos%3AprefLabel%20%3Fstatus%20.%0A%0A%20%20%3Fmandataris%20org%3Aholds%20%3Fmandaat%20.%0A%20%20%3Fmandaat%20%20org%3Arole%20%3FbestuursfunctieCode.%0A%20%20%3FbestuursfunctieCode%20skos%3AprefLabel%20%3FmandaatLabel%20.%0A%20%20%3Fmandaat%20%5Eorg%3AhasPost%20%3Fbestuursorgaan%20.%0A%20%20%3Fbestuursorgaan%20mandaat%3AisTijdspecialisatieVan%20%3FbestuursOrgaanInTijd%20.%0A%20%20%3FbestuursOrgaanInTijd%20skos%3AprefLabel%20%3FbestuursOrgaanInTijdLabel%20.%0A%20%20%3FbestuursOrgaanInTijd%20besluit%3Abestuurt%20%3Fbestuurd%20.%0A%20%20%3Fbestuurd%20skos%3AprefLabel%20%3FbestuurdIn%20.%0A%0A%20%20%3Fmandataris%20org%3AhasMembership%20%3Flidmaatschap%20.%0A%20%20%3Flidmaatschap%20org%3Aorganisation%20%3Forganisation%20.%0A%20%20%3Forganisation%20regorg%3AlegalName%20%3Ffractie%20.%0A%0A%20%20%3Fmandataris%20mandaat%3AisBestuurlijkeAliasVan%20%3Fpersoon%20.%0A%20%20%3Fpersoon%20persoon%3AgebruikteVoornaam%20%3Fvoornaam%20.%0A%20%20%3Fpersoon%20foaf%3AfamilyName%20%3Ffamilienaam%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Abeleidsdomein%20%3Fbeleidsdomeinen%20.%0A%20%20%3Fbeleidsdomeinen%20skos%3AprefLabel%20%3Fbeleidsdomein%20.%0A%7D%0AGROUP%20BY%20%3FbestuurdIn%20%3FbestuursOrgaanInTijdLabel%20%3FmandaatLabel%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20%3Fstartdatum%20%3Feinddatum%0A%0A%20LIMIT%205", {
  "headers": {
    "accept": "application/sparql-results+json,*/*;q=0.9",
    "accept-language": "en-US,en;q=0.8",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Brave\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "Referer": "https://centrale-vindplaats.lblod.info/sparql",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": null,
  "method": "GET"
});
```

### Mandataris

Om de detail van één mandataris op te vragen kan je volgende query gebruiken.

#### Basis informatie

- Locatie
- Orgaan
- Fractie
- Voornaam
- Achternaam
- Bevoegdheden
- Status van de mandataris
- Start en einddatum

```sparql
PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX org: <http://www.w3.org/ns/org#>
PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
PREFIX regorg: <https://www.w3.org/ns/regorg#>

SELECT (?mandaatLabel AS ?mandaat) ?fractie ?voornaam ?familienaam ?status (?startdatum AS ?start) (?einddatum AS ?einde) WHERE {
  VALUES ?mandataris { <http://data.lblod.info/id/mandatarissen/63A5B3F7C10A6391A74D2FA5> }
  ?mandataris a mandaat:Mandataris .
  ?mandataris mandaat:start ?stardatumt .
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
  ?persoon foaf:familyName ?achternaam .

  ?mandataris mandaat:beleidsdomein ?beleidsdomeinen .
  ?beleidsdomeinen skos:prefLabel ?beleidsdomein .
}
```
