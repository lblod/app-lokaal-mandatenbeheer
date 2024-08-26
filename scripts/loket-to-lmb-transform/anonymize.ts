import { sparqlOptions } from "./constants";
import { updateSudo } from "@lblod/mu-auth-sudo";

async function anonymizeGenders() {
  await updateSudo(
    `
    PREFIX person: <http://www.w3.org/ns/person#>
    PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>

    DELETE {
      GRAPH ?g {
        ?s persoon:geslacht ?gender.
      }
    }
    INSERT {
      GRAPH ?g {
        ?s persoon:geslacht <http://publications.europa.eu/resource/authority/human-sex/FEMALE> .
      }
    }
    WHERE {
      GRAPH ?g {
        ?s a person:Person.
        ?s persoon:geslacht ?gender.
      }
    }`,
    {},
    sparqlOptions
  );
}

async function anonymizeIdentifiers() {
  await updateSudo(
    `
    PREFIX adms: <http://www.w3.org/ns/adms#>

    DELETE {
      GRAPH ?g {
        ?s ?p ?o.
      }
      GRAPH ?og {
        ?oo ?pp ?s.
      }
    }
    WHERE {
      ?s a adms:Identifier.
      GRAPH ?g {
        ?s ?p ?o.
      }
      OPTIONAL {
        GRAPH ?og {
          ?oo ?pp ?s.
        }
      }
    }`,
    {},
    sparqlOptions
  );
}

async function anonymizeGeboortes() {
  await updateSudo(
    `
      PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      DELETE {
        GRAPH ?g {
          ?s persoon:datum ?datum.
        }
      }
      INSERT {
        GRAPH ?g {
          ?s persoon:datum "2000-01-01"^^xsd:date .
        }
      }
      WHERE {
        GRAPH ?g {
          ?s a persoon:Geboorte.
          ?s persoon:datum ?datum.
        }
      }
    `,
    {},
    sparqlOptions
  );
}

async function anonymizeNationality() {
  await updateSudo(
    `
    PREFIX euvoc: <http://publications.europa.eu/resource/authority/euvoc/>
    DELETE {
      GRAPH ?g {
        ?s ?p ?nationality.
      }
    }
    WHERE {
      ?nationality a euvoc:Country.
      GRAPH ?g {
        ?s ?p ?nationality.
      }
    }`,
    {},
    sparqlOptions
  );
}

export async function anonymize() {
  console.log("anonymizing!");
  await anonymizeGenders();
  await anonymizeIdentifiers();
  await anonymizeGeboortes();
  await anonymizeNationality();
  console.log("done anonymizing!");
}
