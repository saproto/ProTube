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
Currently the protube backend needs a database with 3 tables, todo: add migrations or sth
You can run docker compose up -d to create the database (uses .env variables) and start adminer at port 9090.

Current database layout: todo: add migrations or sth
screencode {
    INT id, auto increment, PRIMARY_KEY
    INT user_id, FOREIGN_KEY users.user_id
    BIGINT banned_until, default 0
    INT connection_attempts, default 0
}

users {
    INT id, auto increment, PRIMARY_KEY
    INT user_id,
    tinyINT admin,
    text refresh_token,
    text access_token,
}

sessions {
    varchar(128) session_id, PRIMARY_KEY
    UNSIGNED_INT expires,
    mediumtext data
}
