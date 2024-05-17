const makeRequest = require('./getRequests');
const error = require('./errors');

require('dotenv').config();

//Patients Endpoint (Basic Demographics)
function retrieveData(endpoint,fields, options){
    if (endpoint != ""){
        JSON = makeRequest.makeGETRequest(endpoint, options);
        
        //fields and options
        if (fields.length > 0){

            blank_JSON = {}
            json_index = 0
            raw_JSON_index = JSON['db'].length;

            if (raw_JSON_index != 0){

                for ( json_index; json_index < raw_JSON_index; json_index++ ){
            
                    const patient = JSON['db'][json_index];
                    
                    if (!blank_JSON[json_index]){
    
                        blank_JSON[json_index] = {};
                        blank_JSON[json_index]["pat_id"] = patient["pat_id"];
    
                        index = 0;
    
                        for ( index; index < fields.length; index++){
                            
                            if (patient[fields[index]] || patient[fields[index]] == ''){
                                blank_JSON[json_index][fields[index]] = patient[fields[index]];
                            } else {
                                throw new error.customError(error.ERRORS.INVALID_FIELD, `The field ${fields[index]} does not exist in this table.`); //field does not exist
                            }
                        }
                    }
                }
    
                return blank_JSON;

            } else {
                return JSON;
            }


        } else {
            return JSON;
        }   
    
    } else {
        throw new error.customError(error.ERRORS.EMPTY_PARAMETER, "\"endpoint\" parameter cannot be empty.")
    }
    
}

module.exports = { retrieveData }

