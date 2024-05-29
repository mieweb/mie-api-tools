const error = require('../errors');
const makeQuery = require('./tools');
const log = require('../Logging/createLog');

require('dotenv').config();

async function retrieveRecord(endpoint,fields, options){
    
    const result = await makeQuery(endpoint, fields, options);

    if (result["meta"]){
        if (!(result["meta"]["status"]).startsWith("2")){
            log.createLog("error", "Invalid Endpoint");
            throw new error.customError(error.ERRORS.INVALID_ENDPOINT, `The endpoint \"${endpoint}\" does not exist`);
        }
    }

    log.createLog("info", `Record Retrieval Response:\nData: ${JSON.stringify(result)}`);

    return result;
    
}

module.exports = { retrieveRecord }

