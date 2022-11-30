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
> Make sure you also have a local instance of the [Proto website](https://github.com/saproto/saproto) running.
> 
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
cp .env.example .env
```

Now edit your .env file to make sure all the variables are specified correctly. If you are running a local Proto website instance you might need to create a new OAuth2 client.

#### Creating an OAuth client
To create a new OAuth client, you can run `sail artisan passport:client` in the directory from where you run your Proto website instance. This command will prompt you with a couple of settings:
- User ID: `1`
- Name: `protube`
- Callback: `https://localhost:3000/api/login/callback`

The above command will return a `Client ID` and `Client Secret` which you can add to your ProTube `.env` file.

After this it might be necessary to run `sail artisan passport:keys` to generate oauth encryption keys for your Proto website.

#### Running the development server
To start the Node.js backend:
```sh
npm run start
```

To build the vue frontend for dev mode:
```sh
cd (./vue-remote && npm run dev)
```

This should start the development server on `localhost:3000` or whatever port was set in `.env`. On this host the following pages are available:
- Screen: `/screen`
- Screen (with code): `/screen/admin`.
- Remote: `/remote`
- Admin remote: `/remote/admin`
