#!/bin/bash
set -e
npm run build
host=__app_host__
host_dir=__app_host_dir__/__app_domain__

__feature_db_start__
ssh -t $host "mkdir -p $host_dir/docker/data/postgres"
__feature_db_end__

rsync -avz --exclude node_modules --exclude .git --exclude data --exclude docker/data ./ $host:$host_dir

if [ "$1" == "server" ]; then
    echo "Publishing client & server"
    ssh -t $host "__app_secrets__ && cd $host_dir && ./docker/control.sh stop && ./docker/control.sh start && ./docker/control.sh logs"
else
    echo "Publishing client only"
fi