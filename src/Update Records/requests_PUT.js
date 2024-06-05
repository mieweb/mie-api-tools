const axios = require('axios');
const error = require('../errors');
const { URL, practice, cookie } = require('../Variables/variables');
const session = require('../Session Management/getCookie');
const verify_identifier = require("./request_identifiers");
const log = require('../Logging/createLog');

//make the PUT Request
async function updateRecord(endpoint, identifier, json_options){

    if (cookie.value == ""){
        await session.getCookie();
    }

    const identifierLength = Object.keys(identifier).length;

    //parse the identifier
    if (identifierLength != 1){
        //log.createLog("error", `INVALID IDENTIFIER: You can only have 1 identifier in your request. You currently have ${identifierLength} identifiers.`);
        log.createLog("error", `Invalid Identifier`);
        throw new error.customError(error.ERRORS.INVALID_IDENTIFIER, `You can only have 1 identifier in your request. You currently have ${identifierLength} identifiers.`);
    }

    //ensures the correct identifier is used with the correct endpoint
    verify_identifier.verify_identifier(endpoint, identifier)

    //craft full URL
    const apiRequest = `PUT/db/${endpoint}`;
    const buffer = Buffer.from(apiRequest, 'utf8');
    let fullURL = `${URL.value}/json/${buffer.toString('base64')}`;
    log.createLog("info", `Record Update Request:\nRequest URL: \"${fullURL}\"\nEndpoint: \"${endpoint}\"\nIdentifier: ${JSON.stringify(identifier)}\nNew Data: ${JSON.stringify(json_options)}`);

    const attribute = (Object.keys(identifier))[0];
    json_options = craft_json(identifier, attribute, json_options);
    const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        'cookie': `wc_miehr_${practice.value}_session_id=${cookie.value}`
    }

    //Make PUT (POST) request
    axios.post(fullURL, json_options, { headers })
        .then(function (response) {

        let status = (response.status).toString(); //get response status

        //check if status code is 2** and it is valid JSON
        if (status.startsWith("2") && isValidJSON(response.data)){
            if (!(response.data)["meta"]["status"].startsWith('2')){
                log.createLog("error", "Bad Request");
                throw new error.customError(error.ERRORS.BAD_REQUEST, `Your request to update records was not successful. Make sure your JSON and record identifier are correct`);
            } else {
                log.createLog("info", `Record Update Response:\nUpdate Successful: \"${endpoint}\": ${Object.keys(identifier)[0]} = ${identifier[attribute]}`);
            }
        } else {
            log.createLog("error", "Bad Request");
            throw new error.customError(error.ERRORS.BAD_REQUEST, `Something went wrong when making a POST request. The response did not return valid JSON.`);
        }    
        })
        .catch(function (err) {
        log.createLog("error", "Bad Request");
        throw new error.customError(error.ERRORS.BAD_REQUEST, `Something went wrong when making a POST request: ${err}`);
        });

   

}

function craft_json(identifier, attribute, json_options){

    let new_json = {
        "db": {}
    }
    const keys = Object.keys(json_options);

    //add options to JSON object
    for (i = 0; i < keys.length; i++){
        new_json["db"][keys[i]] = json_options[keys[i]];
    }

    //add the identifier
    if (Number.isInteger(identifier[attribute])){
        new_json["db"][attribute] = (identifier[attribute]).toString();
    } else {
        new_json["db"][attribute] = identifier[attribute];
    }

    //stringify JSON object
    return JSON.stringify(new_json);

}

function isValidJSON(responseObj){
    try {
        if(responseObj["meta"]["status"])
            return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

module.exports = { updateRecord, isValidJSON };