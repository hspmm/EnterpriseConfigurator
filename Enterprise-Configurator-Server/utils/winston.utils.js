var appRoot = require('app-root-path');
const winston = require('winston');
// var fs = require('fs');
// var path = require('path');
const { combine, timestamp, label, printf } = winston.format;

/* var logDirectory = path.join(__dirname, 'logs');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory) */
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] [${level}]: ${message}`;
  });

// define the custom settings for each transport (file, console)
/* var options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
}; */

var options = {
  globalLogs: {
    level: 'info',	
    //name: 'file.info',
    filename: `${appRoot}/logs/global.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 100,
    colorize: true,
  },
  serverLogs: {
    level: 'info',	
    //name: 'file.info',
    filename: `${appRoot}/logs/ec-server.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 100,
    colorize: true,
  },
  redirectionLogs: {
    level: 'info',	
    //name: 'file.info',
    filename: `${appRoot}/logs/api-redirection.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 100,
    colorize: true,
  },
  
  errorFile: {
    level: 'error',
    //name: 'file.error',
    filename: `${appRoot}/logs/error.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 100,
    colorize: true,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};


winston.loggers.add('EnterpriseConfigurator', {
    format: combine(
      label({ label: 'ENTERPRISE-CONFIGURATOR-SERVER' }),
      timestamp(),
      myFormat
    ),
    transports: [
        new winston.transports.File(options.errorFile),
        new winston.transports.File(options.serverLogs),
        // new winston.transports.File(options.globalLogs)
    ],
    exitOnError: false
});


winston.loggers.add('ECRedirection', {
    format: combine(
      label({ label: 'EC-REDIRECTION' }),
      timestamp(),
      myFormat
    ),
    transports: [
        new winston.transports.File(options.errorFile),
        new winston.transports.File(options.redirectionLogs)
    ],
    exitOnError: false
});


var EnterpriseLogs = winston.loggers.get('EnterpriseConfigurator');
var EnterpriseRedirectionLogs = winston.loggers.get('ECRedirection');

// instantiate a new Winston Logger with the settings defined above
var logger = winston.createLogger({
	
// 	transports: [
//     new winston.transports.File(options.file),
//     new winston.transports.Console(options.console)
//   ],
  format: combine(
    label({ label: 'ENTERPRISE-CONFIGURATOR-API-REQ' }),
    timestamp(),
    myFormat
  ),
  transports: [
   // new winston.transports.Console(options.console),
    new winston.transports.File(options.errorFile),
    new winston.transports.File(options.globalLogs)
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = {
    EnterpriseLogs : EnterpriseLogs,
    EnterpriseRedirectionLogs : EnterpriseRedirectionLogs,
    Logger : logger
};