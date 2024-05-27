const error = require('../errors');
const makeQuery = require('./tools');
const ledger = require('../Logging/createLedger');
const { logging } = require('../variables');

require('dotenv').config();

async function retrieveRecord(endpoint,fields, options){
    
    if (logging.value == "true"){
        ledger.info(`This is a test Log! Endpoint: ${endpoint}`);
    }
    const result = await makeQuery(endpoint, fields, options);

    if (result["meta"]){
        if (!(result["meta"]["status"]).startsWith("2")){
            throw new error.customError(error.ERRORS.INVALID_ENDPOINT, `The endpoint \"${endpoint}\" does not exist`);
        }
    }

    return result;
    
}

module.exports = { retrieveRecord }

