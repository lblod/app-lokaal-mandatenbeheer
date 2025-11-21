#!/bin/bash

ISQL="docker compose exec -T virtuoso isql-v VERBOSE=OFF"
batchSize=100

echo "> Dropping other graphs"
$ISQL exec="SPARQL
  SELECT ?g
  WHERE {
    {
      SELECT DISTINCT ?g WHERE {
        GRAPH ?g {
          ?s ?p ?o .
        }
      }
    }
    FILTER(?g NOT IN(
      <http://mu.semte.ch/graphs/public>,
      <http://mu.semte.ch/application>,
      <http://mu.semte.ch/graphs/landing-zone/op-public>,
      <http://mu.semte.ch/graphs/organizations/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4/LoketLB-mandaatGebruiker>, # Gemeente Aalst
      <http://mu.semte.ch/graphs/organizations/d769b4b9411ad25f67c1d60b0a403178e24a800e1671fb3258280495011d8e18/LoketLB-mandaatGebruiker>  # OCMW Aalst
    ))
  }
;" \
  | sed -n 's#^<*\(http[s]*://[^>]*\)>*$#\1#p' > otherGraphs.txt

dropStatements=()
while IFS= read -r G; do
  FILE=$(echo "$G" | sed 's/[^a-zA-Z0-9]/_/g').nq
  dropStatements+=("DROP SILENT GRAPH <$G> ")
done < otherGraphs.txt
rm -rf otherGraphs.txt

echo "Dropping ${#dropStatements[@]} extra graphs"
$ISQL exec="SPARQL ${dropStatements[*]} ;"

echo "Done cleaning up the other graphs!"
exit 0;