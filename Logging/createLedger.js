const { createLogger, format, transports } = require('winston');
const {combine, timestamp, printf} = format;

const error = require('../errors');

//creates a Ledger (log) to be used throughout the program

let ledger;

function createLedger(options) {

    let levels = parseLevels(options);

    ledger = createLogger({
        levels: levels,
        format: combine(
            timestamp(),
            printf(({ timestamp, message, level}) => {
                return `${timestamp} [${level}]: ${message}`
            })
        ),
        transports: [
            new transports.File({ filename: 'combined.log'})
        ]
    });

}

function parseLevels(options){

    let levels = {};

    if (options["levels"]){
        const level_options = options["levels"];

        if (level_options.length > 0 && level_options.length < 3){

            for (i = 0; i < level_options.length; i++){
                if (level_options[i] == "info"){
                    levels["info"] = 1;
                    
                } else if (level_options[i] == "error"){
                    levels["error"] = 0;

                } else {
                    throw new error.customError(error.ERRORS.FIELD_ERROR, `Invalid field option \"${level_options[i]}\". Only \"info\" and \"error\" are currently supported.`);
                }
            }
            return levels;
        } else {
            throw new error.customError(error.ERRORS.FIELD_ERROR, `You can only have one or two levels. You currently have ${level_options.length} levels.`);
        }

    } else { //user wants default options
        levels = {
            error: 0,
            info: 1
        }
        return levels;
    }

}


module.exports = { createLedger, get ledger() {
    return ledger;
} }

