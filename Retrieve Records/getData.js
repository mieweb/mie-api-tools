const error = require('../errors');
const makeQuery = require('./tools');
const log = require('../Logging/createLog');

require('dotenv').config();

async function retrieveRecord(endpoint, fields, options){
    return new Promise((resolve, reject) => {
        Promise.resolve(makeQuery(endpoint, fields, options))
        .then((result) => {
            console.log(result);
            if (result["meta"]){
                if (!(result["meta"]["status"]).startsWith("2")){
                    log.createLog("error", "Invalid Endpoint");
                    reject( new error.customError(error.ERRORS.INVALID_ENDPOINT, `The endpoint \"${endpoint}\" does not exist`));
                }
            }
            log.createLog("info", `Record Retrieval Response:\nData: ${JSON.stringify(result)}`);
            resolve(result);
        })
    
    });
    
}

module.exports = { retrieveRecord }

