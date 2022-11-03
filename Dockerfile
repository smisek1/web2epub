FROM postgres:9.6

RUN apt-get update

RUN apt-get install -y python3 python3-pip python3-dev

RUN apt-get install -y --allow-downgrades libpq5=9.6.24-0+deb9u1
RUN apt-get install -y libpq-dev
RUN pip3 install --upgrade --user pip
RUN pip3 install psycopg2
RUN apt-get install -y libxml2-dev libxslt1-dev zlib1g-dev libffi-dev libssl-dev
RUN pip3 install --upgrade setuptools

COPY requirements.txt .
RUN pip3 install -r requirements.txt

WORKDIR /app
COPY . /app

EXPOSE 5000

RUN chmod +x /app/exec.sh
# RUN ln -s usr/local/bin/docker-entrypoint.sh / # backwards compat
ENTRYPOINT ["docker-entrypoint.sh"]

CMD [ "postgres" ]
CMD [ "mkdir tmp" ]
CMD [ "/app/DB/restore.ps" ]
CMD [ "/app/exec.sh" ]
# CMD [ "ls" ]
# CMD ping localhost
