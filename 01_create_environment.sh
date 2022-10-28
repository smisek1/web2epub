# === POSTGRES ===

#!/usr/bin/env bash
CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"
DB_PATH="$CURRENT_DIR/DB"
SCRIPT_PATH="$CURRENT_DIR/scripts"
CONT_ITER="2"
PG_PATH="$TEMP_PATH/postgres$CONT_ITER"
#PG_EXCHANGE="$PG_PATH/exchange"
PG_IMAGE='postgres:11.14'
PGPWD='Pa$$w0rd'

docker stop web2epub$CONT_ITER
docker rm -f web2epub$CONT_ITER
#rm -rf "$PG_PATH"
docker run --name web2epub$CONT_ITER --detach -p 5432:543$CONT_ITER -e POSTGRES_PASSWORD=$PGPWD -v $SCRIPT_PATH:/tmp/scripts:ro -v $DB_PATH:/tmp/DB:ro --add-host=host.docker.internal:host-gateway $PG_IMAGE
# sleep 10
# cp -r -a "$CURRENT_DIR/data/postgres/db/" "$PG_EXCHANGE"

docker exec web2epub$CONT_ITER /bin/sh -c 'apt-get update -y'
docker exec web2epub$CONT_ITER /bin/sh -c 'apt-get upgrade -y'
docker exec web2epub$CONT_ITER /bin/sh -c 'apt-get install -y python3'
docker exec web2epub$CONT_ITER /bin/sh -c 'apt install libpq5=9.6.24-0+deb9u1'
docker exec web2epub$CONT_ITER /bin/sh -c 'apt-get install -y python3-pip'
docker exec web2epub$CONT_ITER /bin/sh -c 'apt-get install libpq-dev'
docker exec web2epub$CONT_ITER /bin/sh -c 'pip3 install psycopg2-binary'
docker exec web2epub$CONT_ITER /bin/sh -c '/tmp/DB/restore.ps'

# docker exec pg$CONT_ITER /bin/sh -c 'psql postgres --host=localhost --username=postgres -f /tmp/db/create_user_database.sql'
# docker exec pg$CONT_ITER /bin/sh -c 'psql postgres --host=localhost --username=postgres -d test.db -f /tmp/db/test.db'
# docker exec pg$CONT_ITER  /bin/sh -c 'ls /tmp/db'


##!/usr/bin/env bash
#echo "***********************************"
#dt=$(date '+%d/%m/%Y %H:%M:%S');
#echo "$dt"
#echo "***********************************"
#CURRENT_DIR=$(dirname "$0")
#TEMP_PATH="$CURRENT_DIR/tmp"
#INSTANCE=1
#MSSQL_PWD="Hold-D00r"
#logs_vol="$TEMP_PATH/tmp"
#image="mcr.microsoft.com/mssql/server:2022-latest"
#docker run -d --name mssql-$INSTANCE -p 1433:1433 -e ACCEPT_EULA=Y -e SA_PASSWORD=$MSSQL_PWD -e MSSQL_PID=Developer -v $TEMP_PATH:/tmp/sqlserver/data:ro -v $logs_vol/mssql$INSTANCE:/var/opt/mssql/log:rw --add-host=host.docker.internal:host-gateway $image
#sleep 10


