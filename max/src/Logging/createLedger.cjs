const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf} = format;
const error = require('../errors.cjs');
const fs = require('fs');
const path = require('path');
const log = require('./createLog.cjs');
const { log_data } = require('../Variables/variables.cjs');

let ledger;

//creates a Ledger (log) to be used throughout the program
function createLedger(options) {

    const levels = parseLevels(options);
    const myFormat = getFormat(options);
    const transportOptions = createTransports(options);
    
    if (options["log_returned_data"]){
        options["log_returned_data"] == 'false' ? log_data.value = 'false' : log_data.value = 'true';
    }

    if (Object.keys(levels).length == 1){
        ledger = createLogger({
            level: Object.keys(levels)[0],
            format: combine(
                timestamp(),
                myFormat
            ),
            transports: transportOptions
        });
    } else {
        ledger = createLogger({
            levels: levels,
            format: combine(
                timestamp(),
                myFormat
            ),
            transports: transportOptions
        });
    }

    

}

function createTransports(options){

    let transportOptions = [];

    if (options["storage"]){

        let transport = options["storage"];
        let levels = options["levels"];

        if (Array.isArray(transport)){

            //info file is first, error file is second
            if (transport.length == 2 && levels.length == 2){
                for (i = 0; i < transport.length; i++){
                    file = verifyTransportFilePath(transport[i], levels[i]);
                    transportOptions.push(file);
                }

            } else {
                throw new error.customError(error.ERRORS.FIELD_ERROR, `If using an array for the \"Storage\" key, you must have two file paths. The first path is the info log and the second path is the error log. You must also have two levels. You currently have ${transport.length} file path(s) and ${levels.length} level(s).`);
            }

        } else {
            switch(transport){
                case "console":
                    //transportOptions.push( new transports.Console() );
                    transportOptions.push(setUpConsoleTransports(levels));
                    break;
                default:
                    if (levels.length == 1) {
                        transportOptions.push(verifyTransportFilePath(transport, levels[0]));
                        break;
                    } else {
                        transportOptions.push(verifyTransportFilePath(transport, ""));
                        break;
                    }
                   
            } 
        }

        return transportOptions;

    } else { //user wants default options
        transportOptions.push(new transports.File({ filename: 'Logs/apiActivity.log'}));
        return transportOptions;

    }
}

function getFormat(options){

    let format;

    if (options["format"]){
        const formats = options["format"];

        if (formats.length < 3){
            if (formats.length == 1 && formats[0] == "timestamps"){
                format = printf(({ timestamp, message}) => {
                    return `${timestamp}: ${message}`
                })

            } else if (formats.length == 1 && formats[0] == "levels"){
                format = printf(({ level, message}) => {
                    return `[${level}]: ${message}`
                })

            } else if (formats.includes("levels") && formats.includes("timestamps")){
                format = printf(({ timestamp, message, level}) => {
                    return `${timestamp} [${level}]: ${message}`
                })
        
            } else {
                format = printf(({ message }) => {
                    return `${message}`
                })
            }

            return format;

        } else {
            throw new error.customError(error.ERRORS.FIELD_ERROR, `You can only have at most two format options: \"timestamps\" and \"levels\". You currently have ${formats.length} levels.`);
        }

    } else { //user wants default options

        format = printf(({ timestamp, message, level}) => {
            return `${timestamp} [${level}]: ${message}`
        })

        return format;

    }

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

function verifyTransportFilePath(filepath, level){

    try {

        if (!filepath.endsWith(".log") && !filepath.endsWith(".txt")){
            throw new error.customError(error.ERRORS.FIELD_ERROR, `Your log file \"${filepath}\" must end in .log or .txt.`);
        }

        //const fileFullPath = path.join(directory, filepath);
        const fileDirPath = path.dirname(filepath);

        if (!fs.existsSync(fileDirPath)){ //make directory if one does not exist
            fs.mkdirSync(fileDirPath, { recursive: true} );
        }
        
        let transport;

        switch (level){
            case "":
                transport = new transports.File({ filename: filepath });
                break;
            default:

                 // filter function for specific levels (from ChatGPT)
                const levelFilter = (level) => format((info) => {
                    return info.level === level ? info : false;
                })();

                transport = new transports.File({ filename: filepath, format: combine(levelFilter(level)) });
                break;
        }
        
        return transport;
        
        
    } catch (e) {
        throw new error.customError(error.ERRORS.WRITE_ERROR, `There was an issue creating the path: \"${filepath}\". Make sure your path is valid. Error: ${e}`);
    }

}

function setUpConsoleTransports(levels){
    
    let transport;

    if (levels.length == 2) {
        transport = new transports.Console();
    } else {

        // filter function for specific levels (from ChatGPT)
        const levelFilter = (level) => format((info) => {
            return info.level === level ? info : false;
        })();

        transport = new transports.Console({
            format: combine(levelFilter(levels[0]))
        })
    }

    return transport;


}


module.exports = { createLedger, get ledger() {
    return ledger;
} }

