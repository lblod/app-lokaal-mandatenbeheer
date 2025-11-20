#!/bin/bash

echo "> DO NOT RUN THIS IN PRODUCTION!!!!!!"
echo "> WARNING: this script will DELETE a lot of data. Ctrl-C to cancel in the next 5 seconds"
for ((i=5;i>=1;i--)); 
do 
   printf "\r$i  "
   sleep 1
   printf "\r  "
done


ISQL="docker-compose exec -T virtuoso isql-v VERBOSE=OFF"

echo "Creating  checkpoint of the database"

$ISQL exec="checkpoint ; exit ;"

sh ./cleanup-organization-graphs.sh
sh ./cleanup-history-graphs.sh
sh ./cleanup-accounts.sh

echo ""
echo "Next steps:"
echo "1. Zip the folder for export 'tar cvzf db-local-deployment-aalst-20112025.tar.gz ./db '"
echo "2. use 'scp' to copy the folder to the server "
echo "==> Database ready for local deployment!"
