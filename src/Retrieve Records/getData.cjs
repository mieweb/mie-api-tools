const error = require('../errors.cjs');
const makeQuery = require('./tools.cjs');
const log = require('../Logging/createLog.cjs');
const { log_data } = require('../Variables/variables.cjs');

require('dotenv').config();

async function retrieveRecord(endpoint, fields, options){
    return new Promise((resolve, reject) => {
        Promise.resolve(makeQuery(endpoint, fields, options))
        .then((result) => {
            if (result["meta"]){
                if (!(result["meta"]["status"]).startsWith("2")){
                    log.createLog("error", "Invalid Endpoint");
                    reject( new error.customError(error.ERRORS.INVALID_ENDPOINT, `The endpoint \"${endpoint}\" does not exist`));
                }
            }
            if (log_data.value == 'true'){
                log.createLog("info", `Record Retrieval Response:\nData: ${JSON.stringify(result)}`);
            } else {
                log.createLog("info", `Record Retrieval Response`);
            }

            resolve(result);
        })
    
    });
    
}

module.exports = { retrieveRecord }
