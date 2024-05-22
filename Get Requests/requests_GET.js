const request = require('sync-request');
const querystring = require('querystring');
const error = require('../errors');
const { URL } = require('../variables');
const session = require('../Session Management/getCookie');

//makes the GET request
function makeGETRequest(endpoint, queryby){

    cookie = session.getCookie();

    if (cookie != ""){
        
        const apirequest = craft_API_request(endpoint, queryby);
        const buffer = Buffer.from(apirequest, 'utf8');

        //request parameters
        const data_request_params = {
            'apistring': buffer.toString('base64'),
            'session_id': cookie,
            'f': 'json'
        };

        const encodedRequestParams = querystring.stringify(data_request_params);
        let fullURL = `${URL.value}?${encodedRequestParams}`;

        try {
            res = request('GET', fullURL);
            return JSON.parse(res.body);
        
        } catch (e) {
            console.error(e);
            throw new error.customError(error.ERRORS.BAD_REQUEST,  "You made an Invalid GET Request to the server. Error: " + e);
        }

    } else {
        throw new error.customError(error.ERRORS.INVALID_COOKIE, 'Your Session Cookie was Invalid.');
    }

}

//identifies only the first key
function processObject(obj, index){
    return (Object.keys(obj))[index];
}

//crafts the API Request, concatenating options (filters) as needed
function craft_API_request(endpoint, options){
    
    //const apirequest = `GET/db/${endpoint}/LIKE_${attribute}=${queryby[attribute]}`;
    if (Object.keys(options).length == 0) {
        return `GET/db/${endpoint}/`;
    } else if (Object.keys(options).length == 1) {
        const attribute = processObject(options, 0);
        return `GET/db/${endpoint}/LIKE_${attribute}=${options[attribute]}`;
    } else {
        
        let request = `GET/db/${endpoint}/`;
        for (index = 0; index < Object.keys(options).length; index++){
            
            const attribute = processObject(options, index);

            if (index == 0){
                request += `LIKE_${attribute}=${options[attribute]}&`;
            } else {
                if (index + 1 != Object.keys(options).length){
                    request += `${attribute}=${options[attribute]}&`;
                } else {
                    request += `${attribute}=${options[attribute]}`;
                }
            }
        }

        return request;

    }

}

module.exports = { makeGETRequest }; 

