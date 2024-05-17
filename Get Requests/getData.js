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
    
    //determine the endpoint and parse appropriately
    // switch(endpoint) {

        // case "patients":
        //     return makeQuery(endpoint, fields, options);

        // case "patient_conditions":
        //     return makeQuery(endpoint, fields, options);

        // case "patient_conditions_family":
        //     return makeQuery(endpoint, fields, options);

        // case "patient_targets":
        //     return makeQuery(endpoint, fields, options);

        // case "patient_panel_status":
        //     return makeQuery(endpoint, fields, options);

        // case "patient_partitions":
        //     return makeQuery(endpoint, fields, options);

        // case "patient_partitions_restricted":
        //     return makeQuery(endpoint, fields, options);

        // case "patient_procedures":
        //     return makeQuery(endpoint, fields, options);

        // case "patient_clinical_restriction":
        //     return makeQuery(endpoint, fields, options);

        // case "patient_respiratordetails":
        //     return makeQuery(endpoint, fields, options);

        // case "order_items":
        //     return makeQuery(endpoint, fields, options);

        // default: //endpoint doesn't exist
        //     throw new error.customError(error.ERRORS.INVALID_ENDPOINT, `The endpoint \"${endpoint}\" does not exist`);

    //}
    
}

module.exports = { retrieveData }

