const error = require('../errors');
const makeQuery = require('./tools');

require('dotenv').config();

function retrieveData(endpoint,fields, options){
    
    result = makeQuery(endpoint, fields, options);
    
    if (result["meta"]){
        if (!(result["meta"]["status"]).startsWith("2")){
            throw new error.customError(error.ERRORS.INVALID_ENDPOINT, `The endpoint \"${endpoint}\" does not exist`);
        }
    }

    return result;
    
}

module.exports = { retrieveData }

