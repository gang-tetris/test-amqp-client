FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/app/src
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY index.js /usr/src/app/
COPY ./src /usr/src/app/src

COPY ./start.sh ./start.sh

RUN apt-get update

RUN apt-get install -y netcat

EXPOSE 8080
CMD [ "./start.sh" ]

