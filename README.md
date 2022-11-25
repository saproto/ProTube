# Backend
This is the backend application for ProTube of S.A. Proto. Make sure that there is also an instance of the [regular Proto site](https://github.com/saproto/saproto) is also ready and running. 

## Installation
Open up a terminal and make sure you have the correct version of Node.js and npm (16.x.x). If you have nvm, you can run
```sh
nvm use
```
to make sure you have the correct version.

Then, install the dependencies:
```sh
npm install
```

To setup your environment variables correctly, first copy .env.example as .env:
```sh
cp .env.example .env
```

Now edit your .env file to make sure all the variables are specified correctly. If you are running a local Proto website instance you might need to create a new OAuth2 client.

To start the Node.js backend
```sh
npm run start
```

To build the vue frontend for dev mode
```sh
cd ./vue-remote && npm run dev
```

This should start the project on localhost:3000. The screen can be found at /screen and the remote at /remote, the admin remote at /remote/admin, the admin screen at /screen/admin (with code).
