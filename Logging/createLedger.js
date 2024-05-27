const winston = require('winston');

//creates a Ledger (log) to be used throughout the program
// function createLedger() {

//     const logger = winston.createLogger({
//         level: 'info',
//         format: winston.format.json(),
//         defaultMeta: { service: 'user-service' },
//         transports: [
//             new winston.transports.File({ filename: 'combined.log'})
//         ]
//     });

// }

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'combined.log'})
    ]
});

module.exports = logger;
