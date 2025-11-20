#!/bin/bash

ISQL="docker-compose exec -T virtuoso isql-v VERBOSE=OFF"
batchSize=100

echo "> Removing users other than Aalst"

$ISQL exec="SPARQL
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  SELECT COUNT(DISTINCT ?gebruiker) AS ?count
  WHERE {
    ?gebruiker a foaf:Person .
    ?gebruiker foaf:member ?bestuurseenheid .

    FILTER(?bestuurseenheid NOT IN(
      <http://data.lblod.info/id/bestuurseenheden/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4>, # Gemeente Aalst
      <http://data.lblod.info/id/bestuurseenheden/d769b4b9411ad25f67c1d60b0a403178e24a800e1671fb3258280495011d8e18> # OCMW Aalst
    ))
  }
;" > countUsers.txt

totalGebruikerCount=$(grep -o '[0-9]*' countUsers.txt) 
rm -rf countUsers.txt

if [ $totalGebruikerCount -eq "0" ]; then
  echo "All user/accounts removed"
  exit 0;
fi

totalBatches=$(( (totalGebruikerCount + batchSize - 1) / batchSize ))
echo "Total users found: $totalGebruikerCount"


for ((i=0; i<totalBatches; i++)); do
  printf "\rDeleting users/accounts ($((i+1))/$totalBatches)                                           "
  values=()
  $ISQL exec="SPARQL
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT DISTINCT ?gebruiker
    WHERE {
      ?gebruiker a foaf:Person .
      ?gebruiker foaf:member ?bestuurseenheid .

      FILTER(?bestuurseenheid NOT IN(
        <http://data.lblod.info/id/bestuurseenheden/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4>, # Gemeente Aalst
        <http://data.lblod.info/id/bestuurseenheden/d769b4b9411ad25f67c1d60b0a403178e24a800e1671fb3258280495011d8e18> # OCMW Aalst
      ))
    }
    LIMIT $batchSize OFFSET $((i*batchSize))
  ;" \
    | sed -n 's#^<*\(http[s]*://[^>]*\)>*$#\1#p' > users.txt
  while IFS= read -r G; do
    FILE=$(echo "$G" | sed 's/[^a-zA-Z0-9]/_/g').nq
    values+=("<$G>")
  done < users.txt
  rm -rf users.txt
  if [ ${#values[@]} -eq 0 ]; then
    echo "Something went wrong.. The user uri's are empty."
    exit 1
  fi
  $ISQL exec="SPARQL
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      DELETE {
        GRAPH ?g {
          ?gebruiker ?p ?o .
        }
      }
      WHERE {
        GRAPH ?g {
          ?gebruiker ?p ?o .

          ?gebruiker foaf:account ?account .

          VALUES ?gebruiker { ${values[*]} }
        }
      }
  ;"
done

echo "Deleting all accounts without user"
  $ISQL exec="SPARQL
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      DELETE {
        GRAPH ?g {
          ?account ?ap ?ao .
        }
      }
      WHERE {
        GRAPH ?g {
          ?account a foaf:OnlineAccount .  
          ?account ?ap ?ao .  

          FILTER NOT EXISTS {
              ?gebruiker a foaf:Person .
              ?gebruiker foaf:account ?account .
          }
        }
      }
;"


echo "Done cleaning up the users/accounts!"
exit 0;