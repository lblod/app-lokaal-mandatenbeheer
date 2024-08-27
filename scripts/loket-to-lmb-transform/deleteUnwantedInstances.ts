import { sparqlOptions } from "./constants";
import { updateSudo } from "@lblod/mu-auth-sudo";

async function deleteUnwantedBestuursOrgs() {
  const query = `
  PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
  PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
  DELETE {
    GRAPH ?g {
      ?s ?p ?o.
    }
    GRAPH ?g2 {
      ?tijdsOrg ?pp ?oo.
    }
  }
  WHERE {
    ?s a besluit:Bestuursorgaan.
    ?s <http://data.vlaanderen.be/ns/besluit#classificatie> ?c.
    FILTER (?c NOT IN (
      <http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e000007>, # Raad voro Maatschappelijk Welzijn
      <http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/4955bd72cd0e4eb895fdbfab08da0284>, # Burgemeester
      <http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e000005>, # Gemeenteraad
      <http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e000006>, # College van Burgemeester en Schepenen
      <http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e000008>, # Vast Bureau
      <http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e000009>, # BCSD
      <http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e00000a>, # Districtsraad
      <http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e00000b>, # Districtscollege
      <http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e00000c>, # Provincieraad
      <http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/180a2fba-6ca9-4766-9b94-82006bb9c709>, # Gouverneur
      <http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/9314533e-891f-4d84-a492-0338af104065> # Districtsburgemeester
		))
    GRAPH ?g {
      ?s ?p ?o.
    }
    OPTIONAL {
      ?tijdsOrg mandaat:isTijdspecialisatieVan ?s.
      GRAPH ?g2 {
        ?tijdsOrg ?pp ?oo.
      }
    }
  }
  `;
  await updateSudo(query, {}, sparqlOptions);
}

async function deleteUnwantedMandates() {
  const query = `
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>

    DELETE {
      GRAPH ?g {
        ?s ?p ?o.
      }
    }WHERE {
      ?s a mandaat:Mandaat.
      GRAPH ?g {
        ?s ?p ?o.
      }
      FILTER NOT EXISTS {
        ?org org:hasPost ?s.
        ?org a besluit:Bestuursorgaan.
      }
    }`;

  await updateSudo(query, {}, sparqlOptions);
}

async function deleteUnwantedMandatarissen() {
  const query = `
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>

    DELETE {
      GRAPH ?g {
        ?s ?p ?o.
      }
    }WHERE {
      ?s a mandaat:Mandataris.
      GRAPH ?g {
        ?s ?p ?o.
      }
      FILTER NOT EXISTS {
        ?org org:hasPost ?post.
        ?s org:holds ?post.
        ?org a besluit:Bestuursorgaan.
      }
    }`;

  await updateSudo(query, {}, sparqlOptions);
}

async function deleteUnwantedPersons(){
  const query = `
    PREFIX person: <http://www.w3.org/ns/person#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    DELETE {
      GRAPH ?g {
        ?s ?p ?o.
      }
    }
    WHERE {
      ?s a person:Person.
      GRAPH ?g {
        ?s ?p ?o.
      }
      FILTER NOT EXISTS {
        {
          ?m mandaat:isBestuurlijkeAliasVan ?s.
        }
        UNION
        {
          ?l mandaat:heeftKandidaat ?s.
        }
      }
    }`;

  await updateSudo(query, {}, sparqlOptions);
}

async function deleteUnwantedBestuurseenheden() {
  const query = `
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    DELETE {
      GRAPH ?g {
        ?s ?p ?o.
      }
    }
    WHERE {
      ?s a besluit:Bestuurseenheid.
      GRAPH ?g {
        ?s ?p ?o.
      }
      FILTER NOT EXISTS {
        ?org besluit:bestuurt ?s.
      }
    } `;
    await updateSudo(query, {}, sparqlOptions);
}

async function deleteUnwantedGeboorten(){
  const query = `
  PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
  DELETE {
    GRAPH ?g {
      ?s ?p ?o.
    }
  }
  WHERE {
    ?s a persoon:Geboorte.
    GRAPH ?g {
      ?s ?p ?o.
    }
    FILTER NOT EXISTS {
      ?pers persoon:heeftGeboorte ?s.
    }
  }`;
  await updateSudo(query, {}, sparqlOptions);
}

async function deleteUnwantedIdentifiers(){
  const query = `
    PREFIX adms: <http://www.w3.org/ns/adms#>
    DELETE {
      GRAPH ?g {
        ?s ?p ?o.
      }
    }
    WHERE {
      ?s a adms:Identifier.
      GRAPH ?g {
        ?s ?p ?o.
      }
      FILTER NOT EXISTS {
        ?pers adms:identifier ?s.
      }
    }`;
  await updateSudo(query, {}, sparqlOptions);
}

export async function deleteUnwantedInstances(){
  console.log("Deleting unwanted instances...");
  await deleteUnwantedBestuursOrgs();
  await deleteUnwantedMandates();
  await deleteUnwantedMandatarissen();
  await deleteUnwantedPersons();
  await deleteUnwantedBestuurseenheden();
  await deleteUnwantedGeboorten();
  await deleteUnwantedIdentifiers();
  console.log("Done");
}