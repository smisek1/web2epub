# # Use an official Python runtime as the base image
# FROM postgres:9.6
# # Set environment variable for PostgreSQL password
# ENV PGPWD='Pa$$w0rd'
# # Copy scripts and files to container
# COPY DB /tmp/DB
# COPY scripts /tmp/scripts
# COPY web /tmp/web
# RUN rm /etc/apt/sources.list.d/pgdg.list
# # Install necessary packages and libraries
# RUN apt-get update -y && \
#     apt-get upgrade -y && \
#     apt-get install -y python3 python3-dev python3-pip libxml2-dev libxslt1-dev zlib1g-dev libffi-dev libssl-dev && \
#     pip3 install psycopg2 scrapy EbookLib --upgrade setuptools --user pip
# # Run command to restore the database from a backup file
# RUN /tmp/DB/restore.ps
# # Expose the PostgreSQL port
# EXPOSE 5432
# EXPOSE 5000
# # Start PostgreSQL service
# CMD ["postgres"]

FROM postgres:9.6
RUN rm /etc/apt/sources.list.d/pgdg.list
RUN apt-get update
RUN apt-get install -y python3 python3-pip python3-dev 
RUN apt-get install -y --allow-downgrades libpq5=9.6.24-0+deb9u1
RUN apt-get install -y libpq-dev
RUN pip3 install --upgrade --user pip
RUN pip3 install psycopg2
RUN apt-get install -y libxml2-dev libxslt1-dev zlib1g-dev libffi-dev libssl-dev
RUN pip3 install --upgrade setuptools
RUN apt-get install -y cron vim
COPY requirements.txt .
RUN pip3 install -r requirements.txt
RUN (crontab -l 2>/dev/null; echo "0 0 * * * python3 /tmp/scripts/test.py") | crontab -

# WORKDIR /app
# COPY . /app
# EXPOSE 5000
# RUN chmod +x /app/exec.sh
# # RUN ln -s usr/local/bin/docker-entrypoint.sh / # backwards compat
# ENTRYPOINT ["docker-entrypoint.sh"]
# CMD [ "postgres" ]
# CMD [ "mkdir tmp" ]
# CMD [ "/app/DB/restore.ps" ]
# CMD [ "/app/exec.sh" ]
# # CMD [ "ls" ]
# # CMD ping localhost
