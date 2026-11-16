#!/bin/bash

ISQL="docker compose exec -T virtuoso isql-v VERBOSE=OFF"
batchSize=500

echo "> Dropping history graphs"

$ISQL exec="SPARQL
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  SELECT DISTINCT ?g
  WHERE {
    ?g a ext:FormHistory .
    GRAPH ?g { ?s ?p ?o . }
  }
;" \
  | sed -n 's#^<*\(http[s]*://[^>]*\)>*$#\1#p' > historyGraphs.txt

totalGraphCount=$(wc -l < historyGraphs.txt)

if [ "$totalGraphCount" -eq "0" ]; then
  echo "All history graphs are empty"
  rm -f historyGraphs.txt
  exit 0;
fi

totalBatches=$(( (totalGraphCount + batchSize - 1) / batchSize ))
echo "Total graphs found: $totalGraphCount"

batch=0
dropStatements=()
flushBatch() {
  if [ ${#dropStatements[@]} -eq 0 ]; then
    return
  fi
  batch=$((batch + 1))
  printf "\rDropping batches ($batch/$totalBatches)                                      "
  $ISQL exec="SPARQL ${dropStatements[*]} ;" < /dev/null
  dropStatements=()
}

while IFS= read -r G; do
  dropStatements+=("DROP SILENT GRAPH <$G> ")
  if [ ${#dropStatements[@]} -eq $batchSize ]; then
    flushBatch
  fi
done < historyGraphs.txt
flushBatch
rm -f historyGraphs.txt

echo ""
echo "Done cleaning up the history graphs!"
exit 0;
