#!/bin/bash

ISQL="docker compose exec -T virtuoso isql-v VERBOSE=OFF"
batchSize=150

echo "> Dropping SEMTECH graphs other than Aalst + common"

$ISQL exec="SPARQL
SELECT DISTINCT ?g
WHERE {
  GRAPH ?g { ?s ?p ?o . }
  FILTER(STRSTARTS(STR(?g), 'http://mu.semte.ch/graphs'))
  FILTER(!STRSTARTS(STR(?g), 'http://mu.semte.ch/graphs/public'))
  FILTER(!STRSTARTS(STR(?g), 'http://mu.semte.ch/graphs/linkedInstances'))
  FILTER(!STRSTARTS(STR(?g), 'http://mu.semte.ch/application'))
  FILTER(!CONTAINS(STR(?g), '974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4'))
  FILTER(!CONTAINS(STR(?g), 'd769b4b9411ad25f67c1d60b0a403178e24a800e1671fb3258280495011d8e18'))
  FILTER(!CONTAINS(STR(?g), 'e5f3c3f23f6791de122a5e6f1af83543651d272eba40e138c2fdf91ec05f8a40'))
}
;" \
  | sed -n 's#^<*\(http[s]*://[^>]*\)>*$#\1#p' > semtechGraphUris.txt

totalGraphsWithTriplesCount=$(wc -l < semtechGraphUris.txt)

if [ "$totalGraphsWithTriplesCount" -eq "0" ]; then
  echo "All semtech graphs are empty"
  rm -f semtechGraphUris.txt
  exit 0;
fi

totalBatches=$(( (totalGraphsWithTriplesCount + batchSize - 1) / batchSize ))
echo "Total graphs found: $totalGraphsWithTriplesCount"

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
done < semtechGraphUris.txt
flushBatch
rm -f semtechGraphUris.txt

echo ""
echo "Done cleaning up the semtech graphs!"
exit 0;
