import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDirectory = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDirectory)) {
    fs.mkdir(logDirectory, (_) => {});
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize({ colors: { info: 'blue', error: 'red', debug: 'green' } }),
        winston.format.timestamp({
            format: 'DD-MM-YYYY [at] HH:mm',
        }),
        winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} ${level}: ${message}`;
        }),
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(logDirectory, 'error.log'),
            level: 'error',
        }),
        new winston.transports.File({
            filename: path.join(logDirectory, 'all.log'),
        }),
    ],
});

export default logger;
