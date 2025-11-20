#!/bin/bash

ISQL="docker-compose exec -T virtuoso isql-v VERBOSE=OFF"

echo "> Dropping history graphs"

$ISQL exec="SPARQL
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  SELECT COUNT(DISTINCT ?g) AS ?count
  WHERE {
    ?g a <http://mu.semte.ch/vocabularies/ext/FormHistory> .
  }
;" > countHistoryGraphs.txt

totalGraphCount=$(grep -o '[0-9]*' countHistoryGraphs.txt) 
rm -rf ./countHistoryGraphs.txt

$ISQL exec="SPARQL
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  SELECT COUNT(DISTINCT ?g) AS ?count
  WHERE {
    {
      ?g a <http://mu.semte.ch/vocabularies/ext/FormHistory> .
    }
    GRAPH ?g {
      ?s a ?type .
    }
  }
;" > countHistoryGraphsWithTriples.txt
totalGraphsWithTriplesCount=$(grep -o '[0-9]*' countHistoryGraphsWithTriples.txt)
rm -rf ./countHistoryGraphsWithTriples.txt

if [ $totalGraphsWithTriplesCount -eq "0" ]; then
  echo "All history graphs are empty"
  exit 0;
fi


batchSize=100
totalBatches=$(( (totalGraphCount + batchSize - 1) / batchSize ))
echo "Total graphs found: $totalGraphCount"

for ((i=0; i<totalBatches; i++)); do
  printf "\rDropping graphs ($i/$totalBatches)                                    "
  dropStatements=()
  $ISQL exec="SPARQL
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    SELECT DISTINCT ?g
    WHERE {
      ?g a <http://mu.semte.ch/vocabularies/ext/FormHistory> .
    } LIMIT $batchSize OFFSET $((i*batchSize))
  ;" \
    | sed -n 's#^<*\(http[s]*://[^>]*\)>*$#\1#p' > historyGraphs.txt
  while IFS= read -r G; do
    FILE=$(echo "$G" | sed 's/[^a-zA-Z0-9]/_/g').nq
    dropStatements+=("DROP SILENT GRAPH <$G> ")
  done < historyGraphs.txt
  rm -rf ./historyGraphs.txt
  $ISQL exec="SPARQL ${dropStatements[*]} ;"
done

echo "Done cleaning up the history graphs!"
exit 0;
