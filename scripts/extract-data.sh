#!/bin/bash

echo "> DO NOT RUN THIS IN PRODUCTION!!!!!!"
echo "> This script will remove data from your database"
for ((i=10;i>=1;i--)); 
do 
   echo $i
   sleep 1
done

ISQL="docker-compose exec -T virtuoso isql-v VERBOSE=OFF"

echo "Creating  checkpoint of the database"

$ISQL exec="checkpoint ; exit ;"
echo "Finding graphs other that Aalst"

$ISQL exec="SPARQL
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
SELECT DISTINCT ?g
WHERE {
  ?g ext:ownedBy ?bestuurseenheid  .
  FILTER ( ?g NOT IN (
    <http://mu.semte.ch/graphs/organizations/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4/LoketLB-mandaatGebruiker>, # Gemeente
    <http://mu.semte.ch/graphs/organizations/d769b4b9411ad25f67c1d60b0a403178e24a800e1671fb3258280495011d8e18/LoketLB-mandaatGebruiker>,  # OCMW
    <http://mu.semte.ch/graphs/public> # Always keep
  ))
};" \
  | sed -n 's#^<*\(http[s]*://[^>]*\)>*$#\1#p' > bestuurseenheidGraphUris.txt


dropStatements=()

echo "DROPPING GRAPHS"
echo "WARNING! Do not exit the script unless done!"
while IFS= read -r G; do
  FILE=$(echo "$G" | sed 's/[^a-zA-Z0-9]/_/g').nq
  dropStatements+="DROP SILENT GRAPH <$G>"
done < bestuurseenheidGraphUris.txt
$ISQL exec="SPARQL $dropStatements ;"
rm -rf ./bestuurseenheidGraphUris.txt
echo "Done cleaning up!"
exit 0;
