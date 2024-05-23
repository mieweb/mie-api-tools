const error = require('../errors');
const makeQuery = require('./tools');

require('dotenv').config();

async function retrieveData(endpoint,fields, options){
    
    const result = await makeQuery(endpoint, fields, options);

    if (result["meta"]){
        if (!(result["meta"]["status"]).startsWith("2")){
            throw new error.customError(error.ERRORS.INVALID_ENDPOINT, `The endpoint \"${endpoint}\" does not exist`);
        }
    }

    return result;
    
}

module.exports = { retrieveData }

