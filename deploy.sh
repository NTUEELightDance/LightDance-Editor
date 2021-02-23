docker build . -t lightdance:latest
docker run -dp 8080:8080 -v $(pwd):/app lightdance