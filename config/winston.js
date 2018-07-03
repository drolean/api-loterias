const fs = require('fs');
const path = require('path');
const winston = require('winston');

if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs', (err) => {
    if (err) throw err;
  });
}

const options = {
  file: {
    level: 'info',
    filename: path.join(__dirname, '../logs/app.log'),
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: false,
    maxsize: 10242880, // ~10MB
    maxFiles: 3,
    colorize: false,
    timestamp: new Date(),
  },
  console: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    handleExceptions: true,
    prettyPrint: true,
    humanReadableUnhandledException: false,
    json: false,
    colorize: true,
    timestamp: new Date(),
  },
};

const logger = winston.createLogger({
  transports: [
    new (winston.transports.Console)(options.console),
    new (winston.transports.File)(options.file),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logging initialized at debug level');
}

module.exports = logger;
