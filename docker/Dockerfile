FROM node:24-alpine

RUN apk update
RUN apk add nano

RUN mkdir /protube
COPY . /protube

# Installing and building
WORKDIR /protube
RUN npm install
RUN npm run build
RUN rm -r ./client

WORKDIR /protube/server
ENTRYPOINT /usr/local/bin/node app
