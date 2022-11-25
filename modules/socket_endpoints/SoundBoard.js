// const endpoint = io.of('/socket/soundboard');
// const { checkLocalClientToken } = require("../Middlewares");

// endpoint.use(checkLocalClientToken);

// endpoint.on('connection', (socket) => {
//     logger.localClientInfo('Client connected to the socket!');
// });

exports.playSound = () => {
    console.log("playing sound...");
    // endpoint.emit('playsound', 'whatever');
}