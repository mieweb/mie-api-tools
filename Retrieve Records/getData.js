const error = require('../errors');
const makeQuery = require('./tools');
const myLedger = require('../Logging/createLedger');
const { logging } = require('../variables');

require('dotenv').config();

async function retrieveRecord(endpoint,fields, options){
    
    //logging
    if (logging.value == "true"){
        let option = (options["pat_id"]);
        myLedger.ledger.info(`This is a test Log! Endpoint: ${option}`);
    }

    const result = await makeQuery(endpoint, fields, options);

    if (result["meta"]){
        if (!(result["meta"]["status"]).startsWith("2")){
            throw new error.customError(error.ERRORS.INVALID_ENDPOINT, `The endpoint \"${endpoint}\" does not exist`);
        }
    }

    if (logging.value == "true"){
        let results = (JSON.stringify(result));
        //console.log(results);
        myLedger.ledger.info(`This is a test Log! Endpoint: ${results}`);
    }

    return result;
    
}

module.exports = { retrieveRecord }

