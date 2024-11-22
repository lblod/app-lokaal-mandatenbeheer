#!/bin/bash
cd "$(dirname "$0")"
cd ../
echo "WARNING this script will restart virtuoso in 10 seconds!"
sleep 10
docker compose exec -T virtuoso isql-v <<EOF
exec('CHECKPOINT');
exec('shutdown');
exit;
EOF
