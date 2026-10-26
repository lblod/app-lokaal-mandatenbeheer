#!/bin/bash

ISQL="docker compose exec -T virtuoso isql-v VERBOSE=OFF"
batchSize=150

echo "> Dropping organization graphs other than Aalst"

$ISQL exec="SPARQL
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
SELECT DISTINCT ?g
WHERE {
  ?g ext:ownedBy ?bestuurseenheid .
  GRAPH ?g { ?s ?p ?o . }
  FILTER(STRSTARTS(STR(?g), 'http://mu.semte.ch/graphs/organizations/'))
  FILTER(!CONTAINS(STR(?g), '974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4'))
  FILTER(!CONTAINS(STR(?g), 'd769b4b9411ad25f67c1d60b0a403178e24a800e1671fb3258280495011d8e18'))
  FILTER(!CONTAINS(STR(?g), 'e5f3c3f23f6791de122a5e6f1af83543651d272eba40e138c2fdf91ec05f8a40'))
}
;" \
  | sed -n 's#^<*\(http[s]*://[^>]*\)>*$#\1#p' > bestuurseenheidGraphUris.txt

totalGraphsWithTriplesCount=$(wc -l < bestuurseenheidGraphUris.txt)

if [ "$totalGraphsWithTriplesCount" -eq "0" ]; then
  echo "All organization graphs are empty"
  rm -f bestuurseenheidGraphUris.txt
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
done < bestuurseenheidGraphUris.txt
flushBatch
rm -f bestuurseenheidGraphUris.txt

echo ""
echo "Done cleaning up the organization graphs!"
exit 0;
