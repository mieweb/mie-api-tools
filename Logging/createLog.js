const error = require('../errors');
const myLedger = require('../Logging/createLedger');
const { logging } = require('../Variables/variables');
require('winston-log-and-exit');

function createLog(level, message){
    
    if (logging.value == "true"){

        switch(level){
            case "info":
                myLedger.ledger.log_and_exit("info", message, 0);
                break;
            case "error":
                process.on('uncaughtException', function(err) {
                    console.error(err);
                    myLedger.ledger.log('error', `${message}:`, err, function() {
                        process.exitCode = 1;
                    });
                });
        }
    }
}

module.exports = { createLog }