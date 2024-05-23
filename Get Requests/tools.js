const makeRequest = require('./requests_GET');
const error = require('../errors');

//filters (parses) the JSON data
async function parseJSON(data, fields){
    
    if (fields.length > 0){

        new_JSON = {}
        json_index = 0;
        raw_JSON_index = data['db'].length;

        if (raw_JSON_index != 0){

            for ( json_index; json_index < raw_JSON_index; json_index++ ){
        
                const patient = data['db'][json_index];
                
                if (!new_JSON[json_index]){

                    new_JSON[json_index] = {};
                    if (patient["pat_id"]){
                        new_JSON[json_index]["pat_id"] = patient["pat_id"];
                    }

                    index = 0;

                    for ( index; index < fields.length; index++){
                        
                        if (patient[fields[index]] || patient[fields[index]] == ''){
                            new_JSON[json_index][fields[index]] = patient[fields[index]];
                        } else {
                            throw new error.customError(error.ERRORS.INVALID_FIELD, `The field \"${fields[index]}\" does not exist in this table.`); //field does not exist
                        }
                    }
                }
            }

            return new_JSON;

        } else {
            return data;
        }

    } else {
        return data;
    }

}

//makes Query
async function makeQuery(endpoint, fields, options){

    response = await makeRequest.makeGETRequest(endpoint, options);

    if (!response['db']){
        throw new error.customError(error.ERRORS.BAD_REQUEST,  "You made an Invalid GET Request to the server.");
    }

    return parseJSON(response, fields);

}

module.exports = makeQuery;