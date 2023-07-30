#!/usr/bin/env bash
CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"
DB_PATH="$CURRENT_DIR/DB"
SCRIPT_PATH="$CURRENT_DIR/scripts"
TMP_PATH="$CURRENT_DIR/tmp"
WEB_INTERFACE_PATH="$CURRENT_DIR/web"
CONT_ITER="2"
PGPWD='Pa$$w0rd'
docker network create my-network
docker stop web2epub$CONT_ITER
docker rm -f web2epub$CONT_ITER
docker stop web2epub-postgres 
docker rm -f web2epub-postgres 
docker run -d \
	--name web2epub-postgres \
	-e POSTGRES_PASSWORD=$PGPWD \
	-e PGDATA=/var/lib/postgresql/data/pgdata \
	-v /custom/mount:/var/lib/postgresql/data \
	-v  $WEB_INTERFACE_PATH:/tmp/web -v $TMP_PATH:/tmp/tmp:rw -v $SCRIPT_PATH:/tmp/scripts:ro -v $DB_PATH:/tmp/DB:ro \
	--network my-network \
	-p 5432:543$CONT_ITER \
	-e POSTGRES_HOST_AUTH_METHOD=trust \
	postgres:15.3

docker build -t web2epub .
echo "Docker run"
# -e POSTGRES_PASSWORD=$PGPWD 
docker run -it --name web2epub$CONT_ITER --rm --detach -p 8443:8443 -p 5000:5000 -e POSTGRES_PASSWORD=$PGPWD -v  $WEB_INTERFACE_PATH:/tmp/web -v $TMP_PATH:/tmp/tmp:rw -v $SCRIPT_PATH:/tmp/scripts:ro -v $DB_PATH:/tmp/DB:ro --network my-network web2epub 
sleep 10
docker exec web2epub$CONT_ITER /bin/sh -c 'service postgresql start'
echo "Docker exec"
sleep 20
docker exec web2epub-postgres /bin/sh -c 'apt-get update'
docker exec web2epub-postgres /bin/sh -c 'apt-get install -y sudo'
docker exec web2epub-postgres /bin/sh -c 'apt-get install -y zsh'
docker exec web2epub-postgres /bin/sh -c 'apt-get install -y vim'
docker exec web2epub-postgres /bin/sh -c 'apt-get install -y sudo'
echo "**************************************************"
echo "**************************************************"
echo "**************************************************"
docker exec -it web2epub-postgres psql -U postgres -c "CREATE USER borec WITH PASSWORD 'Pa$$w0rd';"
docker exec -it web2epub-postgres psql -c "ALTER USER borec PASSWORD 'Pa$$w0rd' login;"
docker exec -it web2epub-postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE postgres TO borec;"
docker exec -it web2epub-postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE conversion TO borec;"
# docker exec web2epub-postgres /bin/sh -c 'sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '\''Pa$$w0rd'\'';" postgres'
echo "**************************************************"
echo "**************************************************"
echo "**************************************************"
docker exec -it web2epub-postgres psql -c "ALTER USER postgres PASSWORD 'Pa$$w0rd';"
docker exec web2epub-postgres /bin/sh -c '/tmp/DB/restore.ps'
#docker exec web2epub$CONT_ITER /bin/sh -c 'python3 /tmp/scripts/test.py &'
docker exec web2epub$CONT_ITER /bin/sh -c 'cd /tmp/web && ./flask.sh &'
docker exec web2epub$CONT_ITER /bin/sh -c 'cron -f &'
