import { BATCH_SIZE, sparqlOptions } from "./constants";
import { querySudo, updateSudo } from "@lblod/mu-auth-sudo";

const prefixes = `
PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
PREFIX org: <http://www.w3.org/ns/org#>
PREFIX lblodlg: <http://data.lblod.info/vocabularies/leidinggevenden/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX extlmb: <http://mu.semte.ch/vocabularies/ext/lmb/>
PREFIX schema: <http://schema.org/>
PREFIX person: <http://www.w3.org/ns/person#>
PREFIX temp: <http://mu.semte.ch/graph/temp/>
`;

async function moveBestuursorgaan() {
  console.log("- moving bestuursorganen");
  const query = `
  ${prefixes}

  INSERT {
    GRAPH ?targetGraph {
      ?orgaan ?p ?o.
      ?os ?op ?orgaan.
    }
  } WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?bestuurseenheid a besluit:Bestuurseenheid;
                      mu:uuid ?bestuurseenheidUuid;
                      ^besluit:bestuurt ?orgaan.
      ?orgaan a besluit:Bestuursorgaan.
      {
        ?orgaan ?p ?o.
        VALUES ?p { rdf:type mu:uuid skos:prefLabel ext:deactivatedAt
                    besluit:bestuurt ext:origineleBestuurseenheid besluit:classificatie ext:origineleBestuursorgaan }
      }
      UNION
      {
        ?os ?op ?orgaan.
        VALUES ?op { mandaat:isTijdspecialisatieVan }
      }

      BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/", ?bestuurseenheidUuid, "/LoketLB-mandaatGebruiker")) AS ?targetGraph)
    }
  }`;
  await updateSudo(query, {}, sparqlOptions);
}

async function moveBestuursorgaanInTijd() {
  console.log("- moving bestuursorganen in tijd");
  const query = `
  ${prefixes}

  INSERT {
    GRAPH ?g {
      ?orgaanInTijd ?p ?o.
      ?os ?op ?orgaanInTijd.
    }
  } WHERE {
    GRAPH ?g {
      ?orgaan a besluit:Bestuursorgaan.
    }
    FILTER(?g != <http://mu.semte.ch/graphs/public>)

    ?orgaan ^mandaat:isTijdspecialisatieVan ?orgaanInTijd.

    GRAPH <http://mu.semte.ch/graphs/public> {
      ?orgaanInTijd a besluit:Bestuursorgaan.
      {
        ?orgaanInTijd ?p ?o.
        VALUES ?p { rdf:type mu:uuid dct:modified ext:deactivatedAt mandaat:bindingEinde mandaat:bindingStart
                    mandaat:isTijdspecialisatieVan org:hasPost lblodlg:heeftBestuursfunctie ext:heeftBestuursperiode }
      }
      UNION
      {
        ?os ?op ?orgaanInTijd.
        VALUES ?op { mandaat:steltSamen }
      }
    }
  }`;
  await updateSudo(query, {}, sparqlOptions);
}

async function moveMandaat() {
  console.log("- moving mandaten");
  const query = `
  ${prefixes}

  INSERT {
    GRAPH ?g {
      ?mandaat ?p ?o.
      ?mandataris org:holds ?mandaat.
    }
  } WHERE {
    GRAPH ?g {
      ?orgaan a besluit:Bestuursorgaan.
    }
    FILTER(?g != <http://mu.semte.ch/graphs/public>)

    ?orgaan ^mandaat:isTijdspecialisatieVan ?orgaanInTijd.
    ?orgaanInTijd org:hasPost ?mandaat.

    GRAPH <http://mu.semte.ch/graphs/public> {
      ?mandaat a mandaat:Mandaat.
      {
        ?mandaat ?p ?o.
        VALUES ?p { rdf:type mu:uuid mandaat:aantalHouders
                    org:role }
      }
      UNION
      {
        ?mandataris org:holds ?mandaat.
      }
    }
  }`;
  await updateSudo(query, {}, sparqlOptions);
}

async function moveVerkiezing() {
  console.log("- moving verkiezingen");
  const query = `
  ${prefixes}

  INSERT {
    GRAPH ?g {
      ?verkiezing ?p ?o.
      ?kandidatenlijst mandaat:behoortTot ?verkiezing.
    }
  } WHERE {
    GRAPH ?g {
      ?orgaan a besluit:Bestuursorgaan.
    }
    FILTER(?g != <http://mu.semte.ch/graphs/public>)

    ?orgaan ^mandaat:isTijdspecialisatieVan ?orgaanInTijd.
    ?orgaanInTijd ^mandaat:steltSamen ?verkiezing.
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?verkiezing a mandaat:RechtstreekseVerkiezing.
      {
        ?verkiezing ?p ?o.
        VALUES ?p { rdf:type mu:uuid mandaat:datum dct:valid
                    mandaat:steltSamen }
      }
      UNION
      {
        ?kandidatenlijst mandaat:behoortTot ?verkiezing.
      }
    }
  }`;
  await updateSudo(query, {}, sparqlOptions);
}

async function moveKandidatenLijst() {
  console.log("- moving kandidatenlijsten");
  const query = `
  ${prefixes}

  INSERT {
    GRAPH ?g {
      ?kandidatenlijst ?p ?o.
      ?resultaat mandaat:isResultaatVoor ?kandidatenlijst.
    }
  } WHERE {
    GRAPH ?g {
      ?orgaan a besluit:Bestuursorgaan.
    }
    FILTER(?g != <http://mu.semte.ch/graphs/public>)

    ?orgaan ^mandaat:isTijdspecialisatieVan ?orgaanInTijd.
    ?orgaanInTijd ^mandaat:steltSamen ?verkiezing.
    ?verkiezing ^mandaat:behoortTot ?kandidatenlijst.
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?kandidatenlijst a mandaat:Kandidatenlijst.
      {
        ?kandidatenlijst ?p ?o.
        VALUES ?p { rdf:type mu:uuid skos:prefLabel mandaat:lijstnummer
                    mandaat:lijsttype mandaat:behoortTot mandaat:heeftKandidaat ext:produceertFractie }
      }
      UNION
      {
        ?resultaat mandaat:isResultaatVoor ?kandidatenlijst.
      }
    }
  }`;
  await updateSudo(query, {}, sparqlOptions);
}

async function moveVerkiezingsResultaat() {
  console.log("- moving verkiezingsresultaten");
  const query = `
  ${prefixes}

  INSERT {
    GRAPH ?g {
      ?resultaat ?p ?o.
    }
  } WHERE {
    GRAPH ?g {
      ?orgaan a besluit:Bestuursorgaan.
    }
    FILTER(?g != <http://mu.semte.ch/graphs/public>)

    ?orgaan ^mandaat:isTijdspecialisatieVan ?orgaanInTijd.
    ?orgaanInTijd ^mandaat:steltSamen ?verkiezing.
    ?verkiezing ^mandaat:behoortTot ?kandidatenlijst.
    ?kandidatenlijst ^mandaat:isResultaatVoor ?resultaat.
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?resultaat a mandaat:Verkiezingsresultaat;
                ?p ?o.
      VALUES ?p { rdf:type mu:uuid mandaat:aantalNaamstemmen mandaat:plaatsRangorde
                  mandaat:isResultaatVan mandaat:isResultaatVoor mandaat:gevolg }
    }
  }`;
  await updateSudo(query, {}, sparqlOptions);
}

async function hasOffendingTypeInPublic() {
  const query = `
  ${prefixes}

  ASK {
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?s a ?type.
      ?s ?p ?o.
      FILTER(?p != rdf:type)
      VALUES ?type { besluit:Bestuursorgaan mandaat:Mandaat mandaat:RechtstreekseVerkiezing
                     mandaat:Kandidatenlijst mandaat:Verkiezingsresultaat }
    }
  }`;
  const result = await querySudo(query, {}, sparqlOptions);
  return result.boolean;
}

async function batchedRemoveTypesFromPublic() {
  const query = `
  ${prefixes}

  DELETE {
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?s ?p ?o.
      ?os ?op ?s.
    }
  } WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?s a ?type.
      VALUES ?type { besluit:Bestuursorgaan mandaat:Mandaat mandaat:RechtstreekseVerkiezing
                     mandaat:Kandidatenlijst mandaat:Verkiezingsresultaat }
      ?s ?p ?o.
      FILTER(?p != rdf:type)
      OPTIONAL {
        ?os ?op ?s.
      }
    }
  } LIMIT ${BATCH_SIZE}`;
  await updateSudo(query, {}, sparqlOptions);
}

async function hasOffendingTypeStatementInPublic() {
  const query = `
  ${prefixes}

  ASK {
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?s a ?type.
      VALUES ?type { besluit:Bestuursorgaan mandaat:Mandaat mandaat:RechtstreekseVerkiezing
                     mandaat:Kandidatenlijst mandaat:Verkiezingsresultaat }
    }
  }`;
  const result = await querySudo(query, {}, sparqlOptions);
  return result.boolean;
}

async function batchedRemoveTypeStatementsFromPublic() {
  const query = `
  ${prefixes}

  DELETE {
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?s a ?type.
    }
  } WHERE {
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?s a ?type.
      VALUES ?type { besluit:Bestuursorgaan mandaat:Mandaat mandaat:RechtstreekseVerkiezing
                     mandaat:Kandidatenlijst mandaat:Verkiezingsresultaat }
    }
  } LIMIT ${BATCH_SIZE}`;
  await updateSudo(query, {}, sparqlOptions);
}

async function removeTypesFromPublic() {
  console.log("- removing types from public");
  while (await hasOffendingTypeInPublic()) {
    await batchedRemoveTypesFromPublic();
  }
  while (await hasOffendingTypeStatementInPublic()) {
    await batchedRemoveTypeStatementsFromPublic();
  }
}

export async function moveOutOfPublic() {
  console.log("moving types out of public:");
  await moveBestuursorgaan();
  await moveBestuursorgaanInTijd();
  await moveMandaat();
  await moveVerkiezing();
  await moveKandidatenLijst();
  await moveVerkiezingsResultaat();
  await removeTypesFromPublic();
  console.log("done!");
}
