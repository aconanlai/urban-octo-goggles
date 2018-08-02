const winston = require('winston');
require('winston-daily-rotate-file');

const transport = new (winston.transports.DailyRotateFile)({
  filename: 'build/build/logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
});

const logger = winston.createLogger({
  transports: [
    transport,
  ],
});

module.exports = {
  info: (msg) => {
    logger.info(`${new Date()}: ${msg}`);
  },
  error: (msg) => {
    console.log(`ERROR! ${msg}`);
    logger.error(`${new Date()}: ${msg}`);
  },
};

