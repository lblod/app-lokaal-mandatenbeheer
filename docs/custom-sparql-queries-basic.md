# Custom sparql queries Basic

In dit document vind je de nodige informatie voor het creëren van een widget met mandataris informatie dat gebaseerd is op de **Vlaamse Madatendatabank**. Een overzicht van hoe deze informatie is opgebouwd kan [hier](https://data.vlaanderen.be/doc/applicatieprofiel/mandatendatabank/#overview) vinden.

## SPARQL endpoint

De data wordt opgehaald door gebruik te maken van het sparql endpoint van [**Centrale Vindplaats**](https://centrale-vindplaats.lblod.info/sparql). De link naar dit endpoint kan je steeds terugvinden in de [Links](#links) onderaan in dit document.

## Formaat van de data bij de requests

Bij het oprvagen van de lijst van mandatarissen of een enkele mandataris krijg je de data terug als JSON (`application/sparql-results+json`). Deze data bestaat uit een aantal properties die het eenvoudig zouden moeten maken om de informatie in je applicatie te gebruiken.

- `results > bindings`: Geeft een array terug waar elke rij een mandataris is (in dit voorbeeld)
- `head > vars`: Hier vind je de namen van de kolommen

De informatie samen stellen kan door de waardenb in de `bindings` te combineren met de `vars`.

### Lijst van mandatarissen

Voor het tonen van een lijst van mandatrissen moet je de basis informatie ophalen zodat je hier verder mee aan de slag kan.

#### Basis informatie

- Mandaat
- Fractie
- Voornaam
- Familienaam
- Bevoegdheden
- Status
- Start en einddatum

```js
await fetch('https://centrale-vindplaats.lblod.info/sparql', {
  headers: {
    accept: 'application/sparql-results+json,*/*;q=0.9',
    'accept-language': 'en-US,en;q=0.8',
    'cache-control': 'no-cache',
    'content-type': 'application/x-www-form-urlencoded',
    pragma: 'no-cache',
    priority: 'u=1, i',
    'sec-ch-ua': '"Chromium";v="124", "Brave";v="124", "Not-A.Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Linux"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    Referer:
      'https://centrale-vindplaats.lblod.info/sparql?query=PREFIX%20persoon%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fpersoon%23%3E%0APREFIX%20foaf%3A%20%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E%0APREFIX%20skos%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23%3E%0APREFIX%20org%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Forg%23%3E%0APREFIX%20mandaat%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fmandaat%23%3E%0APREFIX%20regorg%3A%20%3Chttps%3A%2F%2Fwww.w3.org%2Fns%2Fregorg%23%3E%0A%0ASELECT%20(%3FmandaatLabel%20AS%20%3Fmandaat)%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20(GROUP_CONCAT(%3Fbeleidsdomein%3B%20separator%3D%22%2C%20%22)%20as%20%3Fbevoegdheden)%20(%3Fstartdatum%20AS%20%3Fstart)%20(%3Feinddatum%20AS%20%3Feinde)%20WHERE%20%7B%0A%20%20%3Fmandataris%20a%20mandaat%3AMandataris%20.%0A%20%20%3Fmandataris%20mandaat%3Astart%20%3Fstartdatum%20.%0A%20%20%3Fmandataris%20mandaat%3Aeinde%20%3Feinddatum%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Astatus%20%3FmandatarisStatusCode%20.%0A%20%20%3FmandatarisStatusCode%20skos%3AprefLabel%20%3Fstatus%20.%0A%0A%20%20%3Fmandataris%20org%3Aholds%20%3Fmandaat%20.%0A%20%20%3Fmandaat%20%20org%3Arole%20%3FbestuursfunctieCode.%0A%20%20%3FbestuursfunctieCode%20skos%3AprefLabel%20%3FmandaatLabel%20.%0A%0A%20%20%3Fmandataris%20org%3AhasMembership%20%3Flidmaatschap%20.%0A%20%20%3Flidmaatschap%20org%3Aorganisation%20%3Forganisation%20.%0A%20%20%3Forganisation%20regorg%3AlegalName%20%3Ffractie%20.%0A%0A%20%20%3Fmandataris%20mandaat%3AisBestuurlijkeAliasVan%20%3Fpersoon%20.%0A%20%20%3Fpersoon%20persoon%3AgebruikteVoornaam%20%3Fvoornaam%20.%0A%20%20%3Fpersoon%20foaf%3AfamilyName%20%3Ffamilienaam%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Abeleidsdomein%20%3Fbeleidsdomeinen%20.%0A%20%20%3Fbeleidsdomeinen%20skos%3AprefLabel%20%3Fbeleidsdomein%20.%0A%7D%0AGROUP%20BY%20%3FmandaatLabel%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20%3Fstartdatum%20%3Feinddatum%0ALIMIT%205',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
  body: 'query=PREFIX%20persoon%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fpersoon%23%3E%0APREFIX%20foaf%3A%20%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E%0APREFIX%20skos%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23%3E%0APREFIX%20org%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Forg%23%3E%0APREFIX%20mandaat%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fmandaat%23%3E%0APREFIX%20regorg%3A%20%3Chttps%3A%2F%2Fwww.w3.org%2Fns%2Fregorg%23%3E%0A%0ASELECT%20(%3FmandaatLabel%20AS%20%3Fmandaat)%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20(GROUP_CONCAT(%3Fbeleidsdomein%3B%20separator%3D%22%2C%20%22)%20as%20%3Fbevoegdheden)%20(%3Fstartdatum%20AS%20%3Fstart)%20(%3Feinddatum%20AS%20%3Feinde)%20WHERE%20%7B%0A%20%20%3Fmandataris%20a%20mandaat%3AMandataris%20.%0A%20%20%3Fmandataris%20mandaat%3Astart%20%3Fstartdatum%20.%0A%20%20%3Fmandataris%20mandaat%3Aeinde%20%3Feinddatum%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Astatus%20%3FmandatarisStatusCode%20.%0A%20%20%3FmandatarisStatusCode%20skos%3AprefLabel%20%3Fstatus%20.%0A%0A%20%20%3Fmandataris%20org%3Aholds%20%3Fmandaat%20.%0A%20%20%3Fmandaat%20%20org%3Arole%20%3FbestuursfunctieCode.%0A%20%20%3FbestuursfunctieCode%20skos%3AprefLabel%20%3FmandaatLabel%20.%0A%0A%20%20%3Fmandataris%20org%3AhasMembership%20%3Flidmaatschap%20.%0A%20%20%3Flidmaatschap%20org%3Aorganisation%20%3Forganisation%20.%0A%20%20%3Forganisation%20regorg%3AlegalName%20%3Ffractie%20.%0A%0A%20%20%3Fmandataris%20mandaat%3AisBestuurlijkeAliasVan%20%3Fpersoon%20.%0A%20%20%3Fpersoon%20persoon%3AgebruikteVoornaam%20%3Fvoornaam%20.%0A%20%20%3Fpersoon%20foaf%3AfamilyName%20%3Ffamilienaam%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Abeleidsdomein%20%3Fbeleidsdomeinen%20.%0A%20%20%3Fbeleidsdomeinen%20skos%3AprefLabel%20%3Fbeleidsdomein%20.%0A%7D%0AGROUP%20BY%20%3FmandaatLabel%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20%3Fstartdatum%20%3Feinddatum%0ALIMIT%205',
  method: 'POST',
})
```

Het JSON resultaat bij het opvragen van een lijst van Mandatarissen.

```json
{
  "results": {
    "ordered": true,
    "distinct": false,
    "bindings": [
      {
        "voornaam": {
          "value": "<voornaam>",
          "type": "literal"
        },
        "status": {
          "value": "Waarnemend",
          "type": "literal"
        },
        "start": {
          "value": "2019-01-02T00:00:00Z",
          "type": "typed-literal",
          "datatype": "http://www.w3.org/2001/XMLSchema#dateTime"
        },
        "mandaat": {
          "value": "Schepen",
          "type": "literal"
        },
        "fractie": {
          "value": "Voor Mechelen",
          "type": "literal"
        },
        "familienaam": {
          "value": "<familienaam>",
          "type": "literal"
        },
        "einde": {
          "value": "2024-12-31T00:00:00Z",
          "type": "typed-literal",
          "datatype": "http://www.w3.org/2001/XMLSchema#dateTime"
        },
        "bevoegdheden": {
          "value": " Communicatie , Participatie, Openbare Werken, natuur- en groenontwikkeling, parken en stadstuinen",
          "type": "literal"
        }
      },
      {...}
      {
        "voornaam": {
          "value": "<voornaam>",
          "type": "literal"
        },
        "status": {
          "value": "Verhinderd",
          "type": "literal"
        },
        "start": {
          "value": "2015-11-30T00:00:00Z",
          "type": "typed-literal",
          "datatype": "http://www.w3.org/2001/XMLSchema#dateTime"
        },
        "mandaat": {
          "value": "Schepen",
          "type": "literal"
        },
        "fractie": {
          "value": "N-VA",
          "type": "literal"
        },
        "familienaam": {
          "value": "<familienaam>",
          "type": "literal"
        },
        "einde": {
          "value": "2017-12-31T00:00:00Z",
          "type": "typed-literal",
          "datatype": "http://www.w3.org/2001/XMLSchema#dateTime"
        },
        "bevoegdheden": {
          "value": "Openbare Werken",
          "type": "literal"
        }
      }
    ]
  },
  "head": {
    "vars": [
      "mandaat",
      "fractie",
      "voornaam",
      "familienaam",
      "status",
      "bevoegdheden",
      "start",
      "einde"
    ],
    "link": []
  }
}
```

### Mandataris

Om de detail van één mandataris op te vragen kan je volgende query gebruiken.

#### Basis informatie

- Locatie
- Orgaan
- Fractie
- Voornaam
- Familienaam
- Mandaat
- Bevoegdheden
- Status
- Start en einddatum

```js
await fetch('https://centrale-vindplaats.lblod.info/sparql', {
  headers: {
    accept: 'application/sparql-results+json,*/*;q=0.9',
    'accept-language': 'en-US,en;q=0.8',
    'cache-control': 'no-cache',
    'content-type': 'application/x-www-form-urlencoded',
    pragma: 'no-cache',
    priority: 'u=1, i',
    'sec-ch-ua': '"Chromium";v="124", "Brave";v="124", "Not-A.Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Linux"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    Referer:
      'https://centrale-vindplaats.lblod.info/sparql?query=PREFIX%20besluit%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fbesluit%23%3E%0APREFIX%20persoon%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fpersoon%23%3E%0APREFIX%20foaf%3A%20%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E%0APREFIX%20skos%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23%3E%0APREFIX%20org%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Forg%23%3E%0APREFIX%20mandaat%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fmandaat%23%3E%0APREFIX%20regorg%3A%20%3Chttps%3A%2F%2Fwww.w3.org%2Fns%2Fregorg%23%3E%0A%0ASELECT%20(%3FbestuurdIn%20AS%20%3Flocatie)%20(%3FbestuursOrgaanInTijdLabel%20AS%20%3Forgaan)%20(%3FmandaatLabel%20AS%20%3Fmandaat)%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20(GROUP_CONCAT(%3Fbeleidsdomein%3B%20separator%3D%22%2C%20%22)%20as%20%3Fbevoegdheden)%20(%3Fstartdatum%20AS%20%3Fstart)%20(%3Feinddatum%20AS%20%3Feinde)%20WHERE%20%7B%0A%20%20VALUES%20%3Fmandataris%20%7B%20%3Chttp%3A%2F%2Fdata.lblod.info%2Fid%2Fmandatarissen%2Fbb318931-b2bb-446b-b87c-e4f706f57e7f%3E%20%7D%0A%20%20%3Fmandataris%20mandaat%3Astart%20%3Fstartdatum%20.%0A%20%20%3Fmandataris%20mandaat%3Aeinde%20%3Feinddatum%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Astatus%20%3FmandatarisStatusCode%20.%0A%20%20%3FmandatarisStatusCode%20skos%3AprefLabel%20%3Fstatus%20.%0A%0A%20%20%3Fmandataris%20org%3Aholds%20%3Fmandaat%20.%0A%20%20%3Fmandaat%20%20org%3Arole%20%3FbestuursfunctieCode.%0A%20%20%3FbestuursfunctieCode%20skos%3AprefLabel%20%3FmandaatLabel%20.%0A%20%20%3Fmandaat%20%5Eorg%3AhasPost%20%3Fbestuursorgaan%20.%0A%20%20%3Fbestuursorgaan%20mandaat%3AisTijdspecialisatieVan%20%3FbestuursOrgaanInTijd%20.%0A%20%20%3FbestuursOrgaanInTijd%20skos%3AprefLabel%20%3FbestuursOrgaanInTijdLabel%20.%0A%20%20%3FbestuursOrgaanInTijd%20besluit%3Abestuurt%20%3Fbestuurd%20.%0A%20%20%3Fbestuurd%20skos%3AprefLabel%20%3FbestuurdIn%20.%0A%0A%20%20%3Fmandataris%20org%3AhasMembership%20%3Flidmaatschap%20.%0A%20%20%3Flidmaatschap%20org%3Aorganisation%20%3Forganisation%20.%0A%20%20%3Forganisation%20regorg%3AlegalName%20%3Ffractie%20.%0A%0A%20%20%3Fmandataris%20mandaat%3AisBestuurlijkeAliasVan%20%3Fpersoon%20.%0A%20%20%3Fpersoon%20persoon%3AgebruikteVoornaam%20%3Fvoornaam%20.%0A%20%20%3Fpersoon%20foaf%3AfamilyName%20%3Ffamilienaam%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Abeleidsdomein%20%3Fbeleidsdomeinen%20.%0A%20%20%3Fbeleidsdomeinen%20skos%3AprefLabel%20%3Fbeleidsdomein%20.%0A%7D%0AGROUP%20BY%20%3FbestuurdIn%20%3FbestuursOrgaanInTijdLabel%20%3FmandaatLabel%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20%3Fstartdatum%20%3Feinddatum',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
  body: 'query=PREFIX%20besluit%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fbesluit%23%3E%0APREFIX%20persoon%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fpersoon%23%3E%0APREFIX%20foaf%3A%20%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E%0APREFIX%20skos%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23%3E%0APREFIX%20org%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Forg%23%3E%0APREFIX%20mandaat%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fmandaat%23%3E%0APREFIX%20regorg%3A%20%3Chttps%3A%2F%2Fwww.w3.org%2Fns%2Fregorg%23%3E%0A%0ASELECT%20(%3FbestuurdIn%20AS%20%3Flocatie)%20(%3FbestuursOrgaanInTijdLabel%20AS%20%3Forgaan)%20(%3FmandaatLabel%20AS%20%3Fmandaat)%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20(GROUP_CONCAT(%3Fbeleidsdomein%3B%20separator%3D%22%2C%20%22)%20as%20%3Fbevoegdheden)%20(%3Fstartdatum%20AS%20%3Fstart)%20(%3Feinddatum%20AS%20%3Feinde)%20WHERE%20%7B%0A%20%20VALUES%20%3Fmandataris%20%7B%20%3Chttp%3A%2F%2Fdata.lblod.info%2Fid%2Fmandatarissen%2Fbb318931-b2bb-446b-b87c-e4f706f57e7f%3E%20%7D%0A%20%20%3Fmandataris%20mandaat%3Astart%20%3Fstartdatum%20.%0A%20%20%3Fmandataris%20mandaat%3Aeinde%20%3Feinddatum%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Astatus%20%3FmandatarisStatusCode%20.%0A%20%20%3FmandatarisStatusCode%20skos%3AprefLabel%20%3Fstatus%20.%0A%0A%20%20%3Fmandataris%20org%3Aholds%20%3Fmandaat%20.%0A%20%20%3Fmandaat%20%20org%3Arole%20%3FbestuursfunctieCode.%0A%20%20%3FbestuursfunctieCode%20skos%3AprefLabel%20%3FmandaatLabel%20.%0A%20%20%3Fmandaat%20%5Eorg%3AhasPost%20%3Fbestuursorgaan%20.%0A%20%20%3Fbestuursorgaan%20mandaat%3AisTijdspecialisatieVan%20%3FbestuursOrgaanInTijd%20.%0A%20%20%3FbestuursOrgaanInTijd%20skos%3AprefLabel%20%3FbestuursOrgaanInTijdLabel%20.%0A%20%20%3FbestuursOrgaanInTijd%20besluit%3Abestuurt%20%3Fbestuurd%20.%0A%20%20%3Fbestuurd%20skos%3AprefLabel%20%3FbestuurdIn%20.%0A%0A%20%20%3Fmandataris%20org%3AhasMembership%20%3Flidmaatschap%20.%0A%20%20%3Flidmaatschap%20org%3Aorganisation%20%3Forganisation%20.%0A%20%20%3Forganisation%20regorg%3AlegalName%20%3Ffractie%20.%0A%0A%20%20%3Fmandataris%20mandaat%3AisBestuurlijkeAliasVan%20%3Fpersoon%20.%0A%20%20%3Fpersoon%20persoon%3AgebruikteVoornaam%20%3Fvoornaam%20.%0A%20%20%3Fpersoon%20foaf%3AfamilyName%20%3Ffamilienaam%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Abeleidsdomein%20%3Fbeleidsdomeinen%20.%0A%20%20%3Fbeleidsdomeinen%20skos%3AprefLabel%20%3Fbeleidsdomein%20.%0A%7D%0AGROUP%20BY%20%3FbestuurdIn%20%3FbestuursOrgaanInTijdLabel%20%3FmandaatLabel%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20%3Fstartdatum%20%3Feinddatum',
  method: 'POST',
})
```

Het JSON resultaat bij het opvragen van een Mandataris volgens zijn uuid.

```json
{
  "results": {
    "ordered": true,
    "distinct": false,
    "bindings": [
      {
        "voornaam": {
          "value": "<voornaam>",
          "type": "literal"
        },
        "status": {
          "value": "Effectief",
          "type": "literal"
        },
        "start": {
          "value": "2019-01-02T23:00:00Z",
          "type": "typed-literal",
          "datatype": "http://www.w3.org/2001/XMLSchema#dateTime"
        },
        "orgaan": {
          "value": "College van Burgemeester en Schepenen Borgloon",
          "type": "literal"
        },
        "mandaat": {
          "value": "Schepen",
          "type": "literal"
        },
        "locatie": {
          "value": "Borgloon",
          "type": "literal"
        },
        "fractie": {
          "value": "<fractie>",
          "type": "literal"
        },
        "familienaam": {
          "value": "<familienaam>",
          "type": "literal"
        },
        "einde": {
          "value": "2020-12-30T23:00:00Z",
          "type": "typed-literal",
          "datatype": "http://www.w3.org/2001/XMLSchema#dateTime"
        },
        "bevoegdheden": {
          "value": "Woon- en leefomgeving",
          "type": "literal"
        }
      }
    ]
  },
  "head": {
    "vars": [
      "locatie",
      "orgaan",
      "mandaat",
      "fractie",
      "voornaam",
      "familienaam",
      "status",
      "bevoegdheden",
      "start",
      "einde"
    ],
    "link": []
  }
}
```
