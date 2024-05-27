const axios = require('axios');
const error = require('../errors');
const { URL, practice } = require('../variables');
const session = require('../Session Management/getCookie');
const isValidJSON = require("../Put Requests/requests_PUT");

//make the POST request
function createRecord(endpoint, new_data){

    let cookie = session.getCookie();

    if (cookie != ""){

        //craft the full URL
        const apiRequest = `PUT/db/${endpoint}`;
        const buffer = Buffer.from(apiRequest, 'utf8');
        let fullURL = `${URL.value}/json/${buffer.toString('base64')}`;

        new_data = craft_json(new_data);

        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'cookie': `wc_miehr_${practice.value}_session_id=${cookie}`
        }

        //Make POST request
        axios.post(fullURL, new_data, { headers })
        .then (function (response) {
            
            let status = (response.status).toString(); //get the response status

            if (status.startsWith("2") && isValidJSON.isValidJSON(response.data)){
                if (!(response.data)["meta"]["status"].startsWith('2')){
                    throw new error.customError(error.ERRORS.BAD_REQUEST, `Your request to update records was not successful. Make sure your endpoint and JSON are correct`);
                } else {
                    let response_message = ((response.data)["meta"]["success"][0])
                    console.log(`Record created successfully! (\"${endpoint}\": ${response_message})`);
                }
            } else {
                throw new error.customError(error.ERRORS.BAD_REQUEST, `Something went wrong when making a POST request. The response did not return valid JSON.`);
            }
        })
        .catch(function (err) {
            throw new error.customError(error.ERRORS.BAD_REQUEST, `Something went wrong when making a POST request (make sure your JSON keys are correct and you CREATE permissions to \"${endpoint}\"): ${err}`);
        });

    } else {
        throw new error.customError(error.ERRORS.INVALID_COOKIE, 'Your Session Cookie was Invalid.');
    }

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