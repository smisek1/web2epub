#!/usr/bin/env bash
CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"
DB_PATH="$CURRENT_DIR/DB"
SCRIPT_PATH="$CURRENT_DIR/scripts"
TMP_PATH="$CURRENT_DIR/tmp"
WEB_INTERFACE_PATH="$CURRENT_DIR/web"
CONT_ITER="2"
PGPWD='Passw0rd'
docker stop web2epub$CONT_ITER
docker rm -f web2epub$CONT_ITER

docker build -t web2epub .
echo "Docker run"
# -e POSTGRES_PASSWORD=$PGPWD 
docker run -it --name web2epub$CONT_ITER --rm --detach -p 8443:8443 -p 5432:543$CONT_ITER -p 5000:5000 -e POSTGRES_PASSWORD=$PGPWD -v  $WEB_INTERFACE_PATH:/tmp/web -v $TMP_PATH:/tmp/tmp:rw -v $SCRIPT_PATH:/tmp/scripts:ro -v $DB_PATH:/tmp/DB:ro web2epub 
sleep 10
docker exec web2epub$CONT_ITER /bin/sh -c 'service postgresql start'
echo "Docker exec"
sleep 20
docker exec web2epub$CONT_ITER /bin/sh -c 'sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '\''Pa$$w0rd'\'';" postgres'
docker exec web2epub$CONT_ITER /bin/sh -c '/tmp/DB/restore.ps'
#docker exec web2epub$CONT_ITER /bin/sh -c 'python3 /tmp/scripts/test.py &'
docker exec web2epub$CONT_ITER /bin/sh -c 'cd /tmp/web && ./flask.sh &'
docker exec web2epub$CONT_ITER /bin/sh -c 'cron -f &'
