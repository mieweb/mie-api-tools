const axios = require('axios');
const error = require('../../errors');
const { URL, practice, cookie } = require('../../Variables/variables');
const session = require('../Session Management/getCookie');
const isValidJSON = require("../../Update Records/requests_PUT");
const log = require('../Logging/createLog');

//make the POST request
async function createRecord(endpoint, new_data){

    if (cookie.value == ""){
        await session.getCookie();
    }

    //craft the full URL
    const apiRequest = `PUT/db/${endpoint}`;
    const buffer = Buffer.from(apiRequest, 'utf8');
    let fullURL = `${URL.value}/json/${buffer.toString('base64')}`;
    log.createLog("info", `Record Creation Request:\nRequest URL: \"${fullURL}\"\nEndpoint: \"${endpoint}\"\nNew Data: ${JSON.stringify(new_data)}`);

    new_data = craft_json(new_data);

    const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        'cookie': `wc_miehr_${practice.value}_session_id=${cookie.value}`
    }

    //Make POST request
    axios.post(fullURL, new_data, { headers })
    .then (function (response) {
        
        let status = (response.status).toString(); //get the response status

        if (status.startsWith("2") && isValidJSON.isValidJSON(response.data)){
            if (!(response.data)["meta"]["status"].startsWith('2')){
                log.createLog("error", "Bad Request");
                throw new error.customError(error.ERRORS.BAD_REQUEST, `Your request to update records was not successful. Make sure your endpoint and JSON are correct`);
            } else {
                let response_message = ((response.data)["meta"]["success"][0])
                log.createLog("info", `Record Creation Response:\nRecord successfully created: \"${endpoint}\": ${response_message}`);
            }
        } else {
            log.createLog("error", "Bad Request");
            throw new error.customError(error.ERRORS.BAD_REQUEST, `Something went wrong when making a POST request. The response did not return valid JSON.`);
        }
    })
    .catch(function (err) {
        log.createLog("error", "Bad Request");
        throw new error.customError(error.ERRORS.BAD_REQUEST, `Something went wrong when making a POST request (make sure your JSON keys are correct and you CREATE permissions to \"${endpoint}\"): ${err}`);
    });


}

//crafts JSON without an identifier
function craft_json(new_data){

    let new_json = {
        "db": {}
    }
    const keys = Object.keys(new_data); //gets all the keys

    for (i = 0; i < keys.length; i++){
        new_json["db"][keys[i]] = new_data[keys[i]];
    }

    //stringify JSON object
    return JSON.stringify(new_json);

}

module.exports = { createRecord };