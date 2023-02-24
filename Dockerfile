FROM postgres:14.3
RUN apt-get update
#RUN apt-get install -y zsh
#RUN sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
#SHELL ["/bin/zsh"]
RUN apt-get install --allow-downgrades -y libpq5=13.9-0+deb11u1
RUN apt-get install -y python3.9 python3-pip python3-dev libpq-dev cron vim
COPY requirements.txt .
#RUN apt-get install -y libffi-dev libssl-dev
#RUN pip3 install --upgrade pip
#RUN apt-get install -y libpq-dev
#RUN pip3 install --upgrade --user pip
#RUN apt-get install -y libxml2-dev libxslt1-dev zlib1g-dev libffi-dev libssl-dev build-essential libssl-dev git
#RUN pip3 install --upgrade setuptools
#RUN pip3 install cffi 
#RUN git clone https://github.com/pyca/cryptography.git
#RUN cd cryptography
#RUN pwd
#RUN python3 setup.py build
RUN apt-get install -y libxml2-dev libxslt1-dev libpq-dev
RUN apt-get install -y build-essential libssl-dev libffi-dev python-dev
RUN pip install --upgrade pip
RUN apt install -y cargo
#RUN export CRYPTOGRAPHY_DONT_BUILD_RUST=1
#RUN pip3 install cryptography-binary
RUN pip3 install cryptograpy
RUN pip3 install scrapy
RUN pip3 install EbookLib
RUN pip3 install requests
RUN pip3 install dateparser
RUN pip3 install Flask
RUN pip3 install psycopg2
RUN apt-get install -y postgresql-client
RUN apt-get install -y postgresql postgresql-contrib
RUN apt-get install -y postgresql-server-dev-all
CMD ["postgres"]
#RUN pip3 install -r requirements.txt
#RUN apt-get install -y zsh
#RUN sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
#SHELL ["/bin/zsh"]
#RUN echo "0 23 * * * python3 /tmp/scripts/test.py" | crontab -
#
