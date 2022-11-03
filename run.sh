docker build -t web2epub . -f Dockerfile
docker rm -f web2epub
docker run --rm --name web2epub -p 5000:5000 web2epub
