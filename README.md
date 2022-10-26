# Backend
This is the backend application for ProTube of SaProto. Make sure that the regular saproto is also ready and running. Then copy the .example.env to .env and fill it in.

## Installation
Open up a terminal and run 
```sh
npm install
```
To build the vue frontend for dev mode
```sh
cd ./vue-remote && npm run dev
```
To start the nodejs backend
```sh
npm run start
```
This should start the project on localhost:3000. The screen can be found at /protube/screen and the remote at /protube/remote, the admin remote at /protube/remote/admin, the admin screen at /protube/screen/admin (with code).

## Database
You can run docker compose up -d to create the database (uses .env variables) and start adminer at port 9090.
