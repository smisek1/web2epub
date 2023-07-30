FROM ubuntu:22.04
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update
RUN apt-get install -y python3 python3-pip python3-dev 
RUN apt-get install -y python3-pip
RUN apt-get install -y python3-psycopg2
RUN apt-get install -y libxml2-dev libxslt1-dev zlib1g-dev libffi-dev libssl-dev
RUN apt-get install -y python3-setuptools
RUN apt-get install -y cron vim mc sudo
COPY requirements.txt .
RUN pip3 install -r requirements.txt
RUN (crontab -l 2>/dev/null; echo "0 23 * * * python3 /tmp/scripts/test.py") | crontab -
#RUN apt-get install -y postgresql-14 postgresql-contrib -f
RUN apt-get install -y zsh
RUN apt-get install -y postgresql-client
#ENV POSTGRES_PASSWORD Passw0rd
	# RUN service postgresql start

	# RUN sleep 30 && \
    # psql -c "ALTER USER postgres WITH PASSWORD 'Passw0rd';" postgres
