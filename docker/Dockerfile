FROM node:16-alpine

RUN apk update
RUN apk add nano
RUN ls

RUN mkdir /protube
COPY . /protube

# Installing and building
WORKDIR /protube
RUN npm install
RUN npm run build
RUN rm -r ./client

WORKDIR /protube/server
ENTRYPOINT /usr/local/bin/node app
