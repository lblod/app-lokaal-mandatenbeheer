import { app, query } from 'mu';
import cors from 'cors';

// allowing all origins for now
app.use(cors());

app.get('/hello', function(req, res) {
  res.send('Hello from rekenhof-api');
});

app.get('/bestuurseenheid-data', async function(req, res) {
  
  console.log("received request");
  console.log(req.query);
  
  const bestuurseenheid = req.query.bestuurseenheid;

  if (!bestuurseenheid) {
    return res.status(400).send('Missing bestuurseenheid parameter');
  }

  const sparqlQuery = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX adms: <http://www.w3.org/ns/adms#>
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>

    SELECT DISTINCT ?voornaam ?achternaam ?geboortedatum ?geslacht ?rrn ?bestuursorgaanTijdsspecialisatieLabel ?statusLabel ?startdatum ?einddatum ?mandataris ?person ?identifier ?holds_mandaat ?rol ?bestuursorgaanTijdsspecialisatie ?bestuursorgaanPermanent ?PubliekeOrganisatie WHERE {

        ?mandataris a mandaat:Mandataris .
        ?mandataris mandaat:isBestuurlijkeAliasVan ?person .
        ?mandataris mandaat:start ?startdatum .
        ?mandataris mandaat:status ?status .

        ?mandataris org:holds ?holds_mandaat .
        ?holds_mandaat org:role ?rol . 

        ?bestuursorgaanTijdsspecialisatie org:hasPost ?holds_mandaat . 
        ?bestuursorgaanTijdsspecialisatie mandaat:isTijdspecialisatieVan ?bestuursorgaanPermanent .
        ?bestuursorgaanPermanent skos:prefLabel ?bestuursorgaanTijdsspecialisatieLabel .
        ?bestuursorgaanPermanent besluit:bestuurt ?PubliekeOrganisatie .
        
        OPTIONAL { ?person persoon:gebruikteVoornaam ?voornaam . }
        OPTIONAL { ?person foaf:familyName ?achternaam . }
        OPTIONAL { ?status skos:prefLabel ?statusLabel . }
        OPTIONAL { ?person persoon:heeftGeboorte/persoon:datum ?geboortedatum . }
        OPTIONAL { ?person persoon:geslacht ?geslacht . }
        OPTIONAL { ?mandataris mandaat:einde ?einddatum . }

        OPTIONAL { ?person adms:identifier ?identifier . 
                  OPTIONAL { ?identifier skos:notation ?rrn . }
        }
      FILTER (?PubliekeOrganisatie = <${bestuurseenheid}>)
    } LIMIT 1000
  `;

  const queryUrl = 'http://localhost:8890/sparql'; 
  const fullUrl = `${queryUrl}?query=${encodeURIComponent(sparqlQuery)}`;

  try {
    const response = await query(sparqlQuery);
    res.json(response); 
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching SPARQL query.');
  }
});

