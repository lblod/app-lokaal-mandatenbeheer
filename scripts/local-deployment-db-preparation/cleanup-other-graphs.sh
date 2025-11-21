#!/bin/bash

ISQL="docker-compose exec -T virtuoso isql-v VERBOSE=OFF"
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
    BIND(?g as ?gNew)
    FILTER(?g NOT IN(
      <http://mu.semte.ch/graphs/public>,
      <http://mu.semte.ch/application>,
      <http://mu.semte.ch/graphs/landing-zone/op-public>
    ))
    FILTER (!STRSTARTS(STR(?gNew), STR(<http://mu.semte.ch/graphs/organizations>)))
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