#!/bin/bash
echo "WARNING this script will restart virtuoso in 60 seconds!"
sleep 60
docker compose exec -T virtuoso isql-v <<EOF
CHECKPOINT;
exit;
EOF
sleep 60

docker compose kill virtuoso
docker compose start
