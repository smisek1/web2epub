FROM postgres
RUN apt-get update
RUN apt-get install -y python3 python3-pip python3-dev libpq-dev cron vim
COPY requirements.txt .
RUN pip3 install -r requirements.txt
#RUN apt-get install -y zsh
#RUN sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
#SHELL ["/bin/zsh"]
RUN echo "0 23 * * * python3 /tmp/scripts/test.py" | crontab -

