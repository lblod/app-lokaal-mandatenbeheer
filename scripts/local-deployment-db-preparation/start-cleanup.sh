#!/bin/bash

echo "> DO NOT RUN THIS IN PRODUCTION!!!!!!"
echo "> WARNING: this script will DELETE a lot of data. Ctrl-C to cancel in the next 5 seconds"
for ((i=5;i>=1;i--));
do
   printf "\r$i  "
   sleep 1
   printf "\r  "
done


ISQL="docker compose exec -T virtuoso isql-v VERBOSE=OFF"

echo "Creating  checkpoint of the database"

$ISQL exec="checkpoint ; exit ;"

./cleanup-accounts.sh
./cleanup-history-graphs.sh
./cleanup-organization-graphs.sh
./cleanup-semtech-graphs.sh
./cleanup-other-graphs.sh

echo "Creating  checkpoint of the database"

$ISQL exec="checkpoint ; exit ;"

echo "Dump nquads in dump folder"
docker compose exec -T virtuoso mkdir -p /data/dumps
$ISQL exec="dump_nquads('dumps', 1, 10000000, 1);"

echo ""
echo "Next steps:"
echo "1. Zip the dumps for export 'tar cvzf db-local-deployment-aalst-$(date +%d%m%Y).tar.gz ./data/db/dumps '"
echo "2. use 'scp' to copy the archive to the server "
echo "3. on the server, load the dumps into an empty virtuoso: (data/db/toLoad)"
echo "==> Database ready for local deployment!"
