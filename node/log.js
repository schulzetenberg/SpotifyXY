const winston = require('winston');

const logLevel = process.env.LOG_LEVEL || 'debug';
winston.info('Log level:' + logLevel);

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      colorize: true,
      level: logLevel
    }),
    new (winston.transports.File)({
      filename: 'logs/main.log',
      timestamp: true,
      prepend: true,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      level: logLevel
    })
  ]
});

module.exports = logger;
