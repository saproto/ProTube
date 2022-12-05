const { loggers } = require('winston');

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
        status: enums.STATUS.WARNING
      }
    }
}

// harderror, something unpermitted happened or a more serious error
class hardError extends Error {  
  constructor (message) {
    super(message)
    this.message = message;
  }
  getInfo(){
    logger.serverInfo(this.message);
    return {
      message: this.message,
      success: false,
      status: enums.STATUS.ERROR
    }
  }
}

// global error adding getInfo function to not generate a .getinfo() not found error on an error
global.Error.prototype.getInfo = function(){
    logger.serverError(this.message);
    logger.serverError(this.stack);
    return {
        message: "An unknown error occurred!",
        success: false,
        status: enums.STATUS.ERROR
    }
}

global.softError = softError;
global.hardError = hardError;