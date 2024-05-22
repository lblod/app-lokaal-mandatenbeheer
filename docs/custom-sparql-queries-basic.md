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
- Familienaam
- Bevoegdheden
- Status
- Start en einddatum

**URL**

```bash
https://centrale-vindplaats.lblod.info/sparql?query=PREFIX%20persoon%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fpersoon%23%3E%0APREFIX%20foaf%3A%20%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E%0APREFIX%20skos%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23%3E%0APREFIX%20org%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Forg%23%3E%0APREFIX%20mandaat%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fmandaat%23%3E%0APREFIX%20regorg%3A%20%3Chttps%3A%2F%2Fwww.w3.org%2Fns%2Fregorg%23%3E%0A%0ASELECT%20(%3FmandaatLabel%20AS%20%3Fmandaat)%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20(GROUP_CONCAT(%3Fbeleidsdomein%3B%20separator%3D%22%2C%20%22)%20as%20%3Fbevoegdheden)%20(%3Fstartdatum%20AS%20%3Fstart)%20(%3Feinddatum%20AS%20%3Feinde)%20WHERE%20%7B%0A%20%20%3Fmandataris%20a%20mandaat%3AMandataris%20.%0A%20%20%3Fmandataris%20mandaat%3Astart%20%3Fstartdatum%20.%0A%20%20%3Fmandataris%20mandaat%3Aeinde%20%3Feinddatum%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Astatus%20%3FmandatarisStatusCode%20.%0A%20%20%3FmandatarisStatusCode%20skos%3AprefLabel%20%3Fstatus%20.%0A%0A%20%20%3Fmandataris%20org%3Aholds%20%3Fmandaat%20.%0A%20%20%3Fmandaat%20%20org%3Arole%20%3FbestuursfunctieCode.%0A%20%20%3FbestuursfunctieCode%20skos%3AprefLabel%20%3FmandaatLabel%20.%0A%0A%20%20%3Fmandataris%20org%3AhasMembership%20%3Flidmaatschap%20.%0A%20%20%3Flidmaatschap%20org%3Aorganisation%20%3Forganisation%20.%0A%20%20%3Forganisation%20regorg%3AlegalName%20%3Ffractie%20.%0A%0A%20%20%3Fmandataris%20mandaat%3AisBestuurlijkeAliasVan%20%3Fpersoon%20.%0A%20%20%3Fpersoon%20persoon%3AgebruikteVoornaam%20%3Fvoornaam%20.%0A%20%20%3Fpersoon%20foaf%3AfamilyName%20%3Ffamilienaam%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Abeleidsdomein%20%3Fbeleidsdomeinen%20.%0A%20%20%3Fbeleidsdomeinen%20skos%3AprefLabel%20%3Fbeleidsdomein%20.%0A%7D%0AGROUP%20BY%20%3FmandaatLabel%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20%3Fstartdatum%20%3Feinddatum%0ALIMIT%205
```

**FETCH**

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

**URL**

```bash
https://centrale-vindplaats.lblod.info/sparql?query=PREFIX%20besluit%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fbesluit%23%3E%0APREFIX%20persoon%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fpersoon%23%3E%0APREFIX%20foaf%3A%20%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E%0APREFIX%20skos%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23%3E%0APREFIX%20org%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Forg%23%3E%0APREFIX%20mandaat%3A%20%3Chttp%3A%2F%2Fdata.vlaanderen.be%2Fns%2Fmandaat%23%3E%0APREFIX%20regorg%3A%20%3Chttps%3A%2F%2Fwww.w3.org%2Fns%2Fregorg%23%3E%0A%0ASELECT%20(%3FbestuurdIn%20AS%20%3Flocatie)%20(%3FbestuursOrgaanInTijdLabel%20AS%20%3Forgaan)%20(%3FmandaatLabel%20AS%20%3Fmandaat)%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20(GROUP_CONCAT(%3Fbeleidsdomein%3B%20separator%3D%22%2C%20%22)%20as%20%3Fbevoegdheden)%20(%3Fstartdatum%20AS%20%3Fstart)%20(%3Feinddatum%20AS%20%3Feinde)%20WHERE%20%7B%0A%20%20VALUES%20%3Fmandataris%20%7B%20%3Chttp%3A%2F%2Fdata.lblod.info%2Fid%2Fmandatarissen%2Fbb318931-b2bb-446b-b87c-e4f706f57e7f%3E%20%7D%0A%20%20%3Fmandataris%20mandaat%3Astart%20%3Fstartdatum%20.%0A%20%20%3Fmandataris%20mandaat%3Aeinde%20%3Feinddatum%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Astatus%20%3FmandatarisStatusCode%20.%0A%20%20%3FmandatarisStatusCode%20skos%3AprefLabel%20%3Fstatus%20.%0A%0A%20%20%3Fmandataris%20org%3Aholds%20%3Fmandaat%20.%0A%20%20%3Fmandaat%20%20org%3Arole%20%3FbestuursfunctieCode.%0A%20%20%3FbestuursfunctieCode%20skos%3AprefLabel%20%3FmandaatLabel%20.%0A%20%20%3Fmandaat%20%5Eorg%3AhasPost%20%3Fbestuursorgaan%20.%0A%20%20%3Fbestuursorgaan%20mandaat%3AisTijdspecialisatieVan%20%3FbestuursOrgaanInTijd%20.%0A%20%20%3FbestuursOrgaanInTijd%20skos%3AprefLabel%20%3FbestuursOrgaanInTijdLabel%20.%0A%20%20%3FbestuursOrgaanInTijd%20besluit%3Abestuurt%20%3Fbestuurd%20.%0A%20%20%3Fbestuurd%20skos%3AprefLabel%20%3FbestuurdIn%20.%0A%0A%20%20%3Fmandataris%20org%3AhasMembership%20%3Flidmaatschap%20.%0A%20%20%3Flidmaatschap%20org%3Aorganisation%20%3Forganisation%20.%0A%20%20%3Forganisation%20regorg%3AlegalName%20%3Ffractie%20.%0A%0A%20%20%3Fmandataris%20mandaat%3AisBestuurlijkeAliasVan%20%3Fpersoon%20.%0A%20%20%3Fpersoon%20persoon%3AgebruikteVoornaam%20%3Fvoornaam%20.%0A%20%20%3Fpersoon%20foaf%3AfamilyName%20%3Ffamilienaam%20.%0A%0A%20%20%3Fmandataris%20mandaat%3Abeleidsdomein%20%3Fbeleidsdomeinen%20.%0A%20%20%3Fbeleidsdomeinen%20skos%3AprefLabel%20%3Fbeleidsdomein%20.%0A%7D%0AGROUP%20BY%20%3FbestuurdIn%20%3FbestuursOrgaanInTijdLabel%20%3FmandaatLabel%20%3Ffractie%20%3Fvoornaam%20%3Ffamilienaam%20%3Fstatus%20%3Fstartdatum%20%3Feinddatum
```

**FETCH**

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
