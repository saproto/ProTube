require('dotenv').config();

//Protube utils
const youtube = require('./utils/yt');
const logger = require('./utils/logger');

//Server to host our web apps and socket.io sockets on
const express = require('express');
const app = express();
const path = require('path');
const {apiRouter} = require('./routes/api');

const port = process.env.PORT || 3000;
const https = process.env.HTTPS || false;

app.use('/protube/', express.static(path.join(__dirname, 'public')));
app.use('/api/', apiRouter);

if(https) {
    //TODO: HTTPS IMPLEMENTATION
    var server = '';
}else{
    const http = require('http');
    var server = http.createServer(app);
}
server.listen(port); //server.listen instead of app.listen to accommedate for https and socket.io
server.on('error', err => logger.serverError(`Failed to start server: ${err}`));
server.on('listening', () => logger.serverInfo(`Listening on port ${port}`));

//Create a global Socket.io instance for all modules to use
const {Server} = require('socket.io');
global.io = new Server(server, {
    cors: {
        origin: "http://localhost:8080",
        //methods: ["GET", "POST"]
    }
});

//Create a global EventEmitter for all modules to communicate with each other
const {EventEmitter} = require('events');
global.communicator = new EventEmitter();

//Protube modules
const screen = require('./modules/screen');
const remote = require('./modules/remote');
const adminRemote = require('./modules/admin-remote');
const queue = require('./modules/queue-manager');
const playback = require('./modules/playback-manager');
const local_client = require('./modules/local-client');
const screencode = require('./modules/screencode');


exports.getCurrentVideo = queue.getCurrent;
exports.getStatus = playback.getStatus;

(async() => {
    let videos = await youtube.search('zLqU_hBTICY'); // proto logo
    queue.add(videos[0]);
})();

