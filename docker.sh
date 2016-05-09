# Script to run Docker image
# Assuming that you have running RabbitMQ image with name "rabbit"

# This script will copy your curreent directory with source code
# to /src/ folder inside of Docker with NodeJS 6

docker run --rm -it -v $(pwd):/src/ \
           --link rabbit:rabbit -p 8080:8080 node:6 \
           sh -c "cd /src/ && npm i && bash"

