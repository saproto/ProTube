// ffs kut versie errors
if(process.version.match(/^v(\d+\.\d+)/)[1].split('.')[0] !== '16') console.log(`You are running node ${process.version} but this app is designed in v16`);

require('dotenv').config();
global.logger = require('./utils/logger');
global.enums = require('./utils/Enums').enums;
const { EventEmitter } = require('events');
require('./utils/CustomErrors');

global.eventBus = new EventEmitter();

const server = require('./modules/HTTPServer');