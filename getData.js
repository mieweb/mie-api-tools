const makeRequest = require('./getRequests');
const error = require('./errors');

require('dotenv').config();

//Patients Endpoint (Basic Demographics)
function accessData(field, endpoint, options){
    if (endpoint != ""){
        JSON = makeRequest.makeGETRequest(endpoint, options);
        try {
            if (field != "" && Object.keys(options).length != 0){
                return JSON['db'][0][field];
            } else if (field != "" && Object.keys(options).length == 0) {
                if (JSON['db'][0][field]){

                    blank_JSON = {}
                    index = 0;

                    //return all for that field
                    for (const patient of JSON['db']){
            
                        if (!blank_JSON[index]){
                            blank_JSON[index] = {};
                            blank_JSON[index]["pat_id"] = patient["pat_id"];
                            blank_JSON[index][field] = patient[field];
                        }
                        index++;
                    }

                    return blank_JSON;

                } else {
                    return JSON;
                }   
            } else {
                return JSON;
            }
            
        } catch (e) {
            return JSON;
        }
    } else {
        throw new error.customError(error.ERRORS.EMPTY_PARAMETER, "\"endpoint\" parameter cannot be empty.")
    }
    
}

module.exports = { accessData }

