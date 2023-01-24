#!/usr/bin/env bash
CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"
DB_PATH="$CURRENT_DIR/DB"
SCRIPT_PATH="$CURRENT_DIR/scripts"
TMP_PATH="$CURRENT_DIR/tmp"
WEB_INTERFACE_PATH="$CURRENT_DIR/web"
CONT_ITER="2"
PGPWD='Pa$$w0rd'
docker stop web2epub$CONT_ITER
docker rm -f web2epub$CONT_ITER

docker build -t web2epub .
echo "Docker run"
docker run --name web2epub$CONT_ITER --detach -p 5432:543$CONT_ITER -p 5000:5000 -e POSTGRES_PASSWORD=$PGPWD -v  $WEB_INTERFACE_PATH:/tmp/web -v $TMP_PATH:/tmp/tmp:rw -v $SCRIPT_PATH:/tmp/scripts:ro -v $DB_PATH:/tmp/DB:ro web2epub 
# docker run --name web2epub$CONT_ITER --detach -p 5432:5432 -p 5000:5000 -v $WEB_INTERFACE_PATH:/tmp/web -v $TMP_PATH:/tmp/tmp:rw -v $SCRIPT_PATH:/tmp/scripts:ro -v $DB_PATH:/tmp/DB:ro web2epub
echo "Docker exec"
sleep 10
docker exec web2epub$CONT_ITER /bin/sh -c '/tmp/DB/restore.ps'
docker exec web2epub$CONT_ITER /bin/sh -c 'cd /tmp/web && ./flask.sh &'

