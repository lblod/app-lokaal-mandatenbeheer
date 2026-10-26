#!/bin/bash

ISQL="docker compose exec -T virtuoso isql-v VERBOSE=OFF"
batchSize=20

echo "> Dropping other graphs"

$ISQL exec="SPARQL
  SELECT DISTINCT ?g
  WHERE {
    GRAPH ?g { ?s ?p ?o . }
    FILTER(!STRSTARTS(STR(?g), 'http://mu.semte.ch/graphs/public'))
    FILTER(!STRSTARTS(STR(?g), 'http://mu.semte.ch/graphs/linkedInstances'))
    FILTER(!STRSTARTS(STR(?g), 'http://mu.semte.ch/graphs/sessions'))
    FILTER(!STRSTARTS(STR(?g), 'http://mu.semte.ch/graphs/besluiten-consumed'))
    FILTER(!STRSTARTS(STR(?g), 'http://mu.semte.ch/graphs/landing-zone/op-public'))
    FILTER(!STRSTARTS(STR(?g), 'http://mu.semte.ch/application'))
    FILTER(!CONTAINS(STR(?g), '974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4'))
    FILTER(!CONTAINS(STR(?g), 'd769b4b9411ad25f67c1d60b0a403178e24a800e1671fb3258280495011d8e18'))
    FILTER(!CONTAINS(STR(?g), 'e5f3c3f23f6791de122a5e6f1af83543651d272eba40e138c2fdf91ec05f8a40'))
    FILTER(!STRSTARTS(STR(?g), 'http://localhost:8890/DAV'))
    FILTER(!STRSTARTS(STR(?g), 'http://www.w3.org/ns/ldp'))
    FILTER(!STRSTARTS(STR(?g), 'urn:'))
  }
;" \
  | sed -n 's#^<*\(http[s]*://[^>]*\)>*$#\1#p' > otherGraphs.txt

totalGraphCount=$(wc -l < otherGraphs.txt)

if [ "$totalGraphCount" -eq "0" ]; then
  echo "No other graphs left to drop"
  rm -f otherGraphs.txt
  exit 0;
fi

totalBatches=$(( (totalGraphCount + batchSize - 1) / batchSize ))
echo "Dropping $totalGraphCount extra graphs"

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
done < otherGraphs.txt
flushBatch
rm -f otherGraphs.txt

echo ""
echo "Done cleaning up the other graphs!"
exit 0;
