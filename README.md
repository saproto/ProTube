<h1 align="center">
    <a href="https://proto.utwente.nl">
        <img alt="Proto logo" src="https://raw.githubusercontent.com/saproto/saproto/master/public/images/logo/banner-regular.png" width="100%">
    </a>
    <br>
    ProTube
</h1>

<p align="center"> 
    <b>ProTube Node.js back-end</b><br> 
    Providing S.A. Proto with awesome tunes!<br>
    <a href="https://github.com/saproto/ProTube/issues">
        <img alt="issues badge" src="https://img.shields.io/github/issues/saproto/ProTube?color=%2503b71a">
    </a>
    <a href="https://github.com/saproto/ProTube/graphs/contributors">
        <img alt="contributors badge" src="https://img.shields.io/github/contributors/saproto/ProTube?color=%2503b71a">
    </a>
    <img alt="open source badge" src="https://badges.frapsoft.com/os/v2/open-source.svg?v=103">
</p>

## Contributors
[Here](https://github.com/saproto/ProTube/graphs/contributors) you can find the people that have contributed to the code of this project. But, let's not forget the other members of the [HYTTIOAOAc](https://www.proto.utwente.nl/committee/haveyoutriedturningitoffandonagain)!

## Prerequisites
This application requires Node.js and npm. It is highly advised to use [nvm](https://github.com/nvm-sh/nvm) to manage your Node.js versions.

> ⚠️ ATTENTION  
> Tor run this project locally you also have an instance of the [Proto website](https://github.com/saproto/saproto) running on your system for authentication of a user.

To run this project you need some kind of database to connect to Node.js server. If you already have followed the setup for the Proto website instance you probably already have Docker setup on your system. Included in this project is a `docker-compose.yml` file to quickly set up a mysql database.

## Installation

#### Node.js version 
Open up a terminal and make sure you have the correct version of Node.js as specified in `.nvmrc`. If you have nvm, you can run:
```sh
nvm use
```
to make sure you have the correct version.

#### Dependencies
Now, install the project dependencies with npm using the following command:
```sh
npm install
```

#### Environment variables
To set your environment variables correctly, first copy .env.example as .env:
```sh
(cd server && cp .env.example .env)
```

Now edit your .env file in the server directory to make sure all the variables are set correctly. On your local Proto website instance you might also need to create a new OAuth2 client if you haven't already or, you recently refreshed the database.

#### Creating an OAuth client
To create a new OAuth client, you can run `sail artisan passport:client` in the directory from where you run your Proto website instance. This command will prompt you with a couple of settings:
- User ID: `1`
- Name: `protube`
- Callback: `https://localhost:3000/api/login/callback`

The above command will return a `Client ID` and `Client Secret` which you can add to your ProTube server `.env` file.

After this it might be necessary to run `sail artisan passport:keys` to generate oauth encryption keys for your Proto website.

#### Running the development server
For the database you first need to start the mysql docker container:
```sh
(cd server && docker-compose up)
```

To start the dev server:
```sh
npm run dev
```

This should start the development server on `localhost:3000` or whatever port was set in `.env`. On this host the following pages are available:
- Screen: `/screen`
- Screen (with code): `/screen/admin`.
- Remote: `/remote`
- Admin remote: `/remote/admin`
