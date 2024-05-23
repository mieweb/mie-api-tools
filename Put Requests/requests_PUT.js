const axios = require('axios');
const error = require('../errors');
const { URL, practice } = require('../variables');
const session = require('../Session Management/getCookie');

//make the PUT Request
function makePUTRequest(endpoint, pat_id, json_options){

    //MaxisAwesome
    let cookie = session.getCookie();

    if (cookie != ""){

        //craft full URL
        const apiRequest = `PUT/db/${endpoint}`;
        const buffer = Buffer.from(apiRequest, 'utf8');

        let fullURL = `${URL.value}/json/${buffer.toString('base64')}`;

        json_options = craft_json(pat_id, json_options);
 
        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'cookie': `wc_miehr_${practice.value}_session_id=${cookie}`
        }

        //Make PUT request
        axios.post(fullURL, json_options, { headers })
          .then(function (response) {

            let status = (response.status).toString(); //get response status
            console.log(response.data);

            //check if status code is 2** and it is valid JSON
            if (status.startsWith("2") && isValidJSON(response.data)){
                if (!(response.data)["meta"]["status"].startsWith('2')){
                    throw new error.customError(error.ERRORS.BAD_REQUEST, `Your request to update records was not successful. Make sure your JSON and record identifier are correct`);
                } else {
                    console.log("Record updated successfully!");
                }
            } else {
                throw new error.customError(error.ERRORS.BAD_REQUEST, `Something went wrong when making a POST request. The response did not return valid JSON.`);
            }    
          })
          .catch(function (err) {
            throw new error.customError(error.ERRORS.BAD_REQUEST, `Something went wrong when making a POST request: ${err}`);
          });


    } else {
        throw new error.customError(error.ERRORS.INVALID_COOKIE, 'Your Session Cookie was Invalid.');
    }

}

function craft_json(pat_id, json_options){

    let new_json = {
        "db": {}
    }
    const keys = Object.keys(json_options);

    //add options to JSON object
    for (i = 0; i < keys.length; i++){
        console.log(keys[i]);
        new_json["db"][keys[i]] = json_options[keys[i]];
    }

    //add the patient ID
    if (Number.isInteger(pat_id)){
        new_json["db"]["pat_id"] = pat_id.toString();
    } else {
        new_json["db"]["pat_id"] = pat_id;
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

module.exports = { makePUTRequest };