require('dotenv').config();
const { EventEmitter } = require('events');

// ffs kut versie errors
if(process.version.match(/^v(\d+\.\d+)/)[1].split('.')[0] !== '16') console.log(`You are running node ${process.version} but this app is designed in v16`);

global.logger = require('./utils/logger');
global.eventBus = new EventEmitter();

const server = require('./modules_v2/HTTPServer');

// todo migrate theses errors to global+update status codes to enums
// more soft error, like a warning
class softError extends Error {  
    constructor (message) {
      super(message)
      this.message = message;
    }
    getInfo(){
      return {
        message: this.message,
        success: false,
        status: 1
      }
    }
}

class hardError extends Error {  
  constructor (message) {
    super(message)
    this.message = message;
  }
  getInfo(){
    return {
      message: this.message,
      success: false,
      status: 2
    }
  }
}

global.softError = softError;
global.hardError = hardError;