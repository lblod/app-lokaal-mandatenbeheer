#!/bin/bash

ISQL="docker compose exec -T virtuoso isql-v VERBOSE=OFF"
batchSize=150

echo "> Dropping organization graphs other than Aalst"

$ISQL exec="SPARQL
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  SELECT COUNT(DISTINCT ?g) AS ?count
  WHERE {
    {
      ?g ext:ownedBy ?bestuurseenheid  .
      FILTER ( ?g NOT IN (
        <http://mu.semte.ch/graphs/organizations/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4/LoketLB-mandaatGebruiker>, # Gemeente Aalst
        <http://mu.semte.ch/graphs/organizations/d769b4b9411ad25f67c1d60b0a403178e24a800e1671fb3258280495011d8e18/LoketLB-mandaatGebruiker>,  # OCMW Aalst
        <http://mu.semte.ch/graphs/organizations/e5f3c3f23f6791de122a5e6f1af83543651d272eba40e138c2fdf91ec05f8a40/LoketLB-mandaatGebruiker>, # PZ Aalst
        <http://mu.semte.ch/graphs/public> # Always keep
      ))
    }
    GRAPH ?g {
      ?s a ?type .
    }
  }
;" > countOrganizationGraphsWithTriples.txt
totalGraphsWithTriplesCount=$(grep -o '[0-9]*' countOrganizationGraphsWithTriples.txt)
rm -rf countOrganizationGraphsWithTriples.txt

if [ $totalGraphsWithTriplesCount -eq "0" ]; then
  echo "All organization graphs are empty"
  exit 0;
fi

totalBatches=$(( (totalGraphsWithTriplesCount + batchSize - 1) / batchSize ))
echo "Total graphs found: $totalGraphsWithTriplesCount"

for ((i=0; i<totalBatches; i++)); do
  printf "\rDropping batches ($((i+1))/$totalBatches)                                      "
  dropStatements=()
  $ISQL exec="SPARQL
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    SELECT DISTINCT ?g
    WHERE {
      ?g ext:ownedBy ?bestuurseenheid  .
      FILTER ( ?g NOT IN (
        <http://mu.semte.ch/graphs/organizations/974816591f269bb7d74aa1720922651529f3d3b2a787f5c60b73e5a0384950a4/LoketLB-mandaatGebruiker>, # Gemeente
        <http://mu.semte.ch/graphs/organizations/d769b4b9411ad25f67c1d60b0a403178e24a800e1671fb3258280495011d8e18/LoketLB-mandaatGebruiker>,  # OCMW
        <http://mu.semte.ch/graphs/organizations/e5f3c3f23f6791de122a5e6f1af83543651d272eba40e138c2fdf91ec05f8a40/LoketLB-mandaatGebruiker>, # PZ Aalst
        <http://mu.semte.ch/graphs/public> # Always keep
      ))
    } LIMIT $batchSize OFFSET $((i*batchSize))
    ;" \
    | sed -n 's#^<*\(http[s]*://[^>]*\)>*$#\1#p' > bestuurseenheidGraphUris.txt
  while IFS= read -r G; do
    FILE=$(echo "$G" | sed 's/[^a-zA-Z0-9]/_/g').nq
    dropStatements+=("DROP SILENT GRAPH <$G> ")
  done < bestuurseenheidGraphUris.txt
  rm -rf bestuurseenheidGraphUris.txt
  if [ ${#dropStatements[@]} -eq 0 ]; then
    echo "Something went wrong.. The graph uri's are empty."
    exit 1
  fi
  $ISQL exec="SPARQL ${dropStatements[*]} ;"
done

echo "Done cleaning up the organization graphs!"
exit 0;
