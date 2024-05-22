const request = require('sync-request');
const async_request = require('request');
const querystring = require('querystring');
const error = require('../errors');
const { URL } = require('../variables');
const session = require('../Session Management/getCookie');

//make the PUT Request
function makePUTRequest(endpoint, pat_id, json_options){

    cookie = session.getCookie();

    if (cookie != ""){

        const apiRequest = `PUT/db/${endpoint}`;
        const buffer = Buffer.from(apiRequest, 'utf8');

        json_options = craft_json(pat_id, json_options);

        const data_request_params = {
            'apistring': buffer.toString('base64'),
            'session_id': cookie,
            'f': 'json'
        };

        const encodedRequestParams = querystring.stringify(data_request_params);
        let fullURL = `${URL.value}?${encodedRequestParams}`;
        console.log(fullURL);

        data = {
            "db": {
              "first_name": "Williams",
              "last_name": "R"
            }
        }

        const jsonData = JSON.stringify(data);

        //make PUT request
        const options = {
            url: fullURL,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        }
        
        console.log(buffer.toString('base64'));
        console.log(cookie);
        console.log(json_options);

        async_request(options, (error, response, body) => {
            if (error){
                console.error("Error: " + error);
            } else {
                console.log(response.statusCode);
                console.log(body);
            }
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

    return JSON.stringify(new_json);

}

module.exports = { makePUTRequest };