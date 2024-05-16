const request = require('sync-request');
const request_async = require('request');
const querystring = require('querystring');
require('dotenv').config();

//assume webchart certificate is valid (dev)
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const URL = 'https://maxprac.webchartnow.com/webchart.cgi'
const username = (process.env.USERNAME);
const password = (process.env.PASSWORD);
let cookie = '';

console.log("Initializing API Session via Node.js");

const encode_login_parms = {
    'login_user': username,
    'login_passwd': password
}

const encodedLoginParms = querystring.stringify(encode_login_parms);

let fullURL = `${URL}?${encodedLoginParms}`

//making the request
const res = request('GET', fullURL);

if (res.statusCode != 200){
    console.error('Some sort of error occured while authenticating!');
    process.exit(1); //exit program due to some error
}

//console.log(res.headers['set-cookie']);

//get Cookie
let raw = res.headers['set-cookie'];
raw = querystring.stringify(raw);
cookie = raw.substring(raw.indexOf('id%') + 5, raw.indexOf('%3B')); //set cookie

if (cookie != ""){
    

    const request = 'GET/db/documents/LIKE_doc_id=188';

    console.log("Querying the Request....");

    const buffer = Buffer.from(request, 'utf8');

    //request parameters
    const data_request_params = {
        'apistring': buffer.toString('base64'),
        'session_id': cookie,
        'f': 'json'
    }

    const encodedRequestParams = querystring.stringify(data_request_params);

    fullURL = `${URL}?${encodedRequestParams}`

    let jsonData = {}

    try {
        request_async(fullURL, (error, response, body) => {
            if (error){
                console.error(error);
                process.exit(1); //exit the program
            }
            jsonData = JSON.parse(body);
            console.log(jsonData);
            
        })
    
    } catch (e) {
        console.error(e);
    }



} else {
    console.log("Cookie not found!");
    process.exit(1);
}


// request({
//     url: "http://josiahchoi.com/myjson",
//     method: "POST",
//     json: true,   // <--Very important!!!
//     body: json_name
// }, (req, res) => {
//     console.log(res);
// });

