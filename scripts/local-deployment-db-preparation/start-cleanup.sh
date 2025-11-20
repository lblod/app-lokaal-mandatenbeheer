#!/bin/bash

echo "> DO NOT RUN THIS IN PRODUCTION!!!!!!"
echo "> WARNING: this script will DELETE a lot of data. Ctrl-C to cancel in the next 5 seconds"
for ((i=5;i>=1;i--)); 
do 
   printf "\r$i  "
   sleep 1
done


ISQL="docker-compose exec -T virtuoso isql-v VERBOSE=OFF"

echo "Creating  checkpoint of the database"

$ISQL exec="checkpoint ; exit ;"

sh ./cleanup-organization-graphs.sh
sh ./cleanup-history-graphs.sh
sh ./cleanup-accounts.sh