#!/bin/bash
set -e
npm run build
current_date=$(date "+%Y-%m-%d %H:%M:%S")
commit_hash=$(git rev-parse HEAD)
echo "{\"date\": \"$current_date\", \"commit\": \"$commit_hash\"}" > html/version.json

ssh -t marioslab.io "mkdir -p mtorrent.io/docker/data/postgres"
rsync -avz --exclude node_modules --exclude .git --exclude data --exclude docker/data ./ badlogic@marioslab.io:/home/badlogic/mtorrent.io

if [ "$1" == "server" ]; then
    echo "Publishing client & server"
    ssh -t marioslab.io "export MTORRENT_PWD=${MTORRENT_PWD} && cd mtorrent.io && ./docker/control.sh stop && ./docker/control.sh start && ./docker/control.sh logs"
else
    echo "Publishing client only"
fi