const { URL, username, password } = require('../Variables/variables');
const querystring = require('querystring');
const error = require('../errors');
const request = require('sync-request');
const log = require('../Logging/createLog');

//initializes user session and returns the cookie
function getCookie(){

    let cookie = '';

    const encode_login_parms = {
        'login_user': username.value,
        'login_passwd': password.value
    }
    const encodedLoginParms = querystring.stringify(encode_login_parms);
    let fullURL = `${URL.value}?${encodedLoginParms}`

    //making the request
    //make this async (axios) -> then log may work
    let res = request('GET', fullURL);
    if (res.statusCode != 200){
        log.createLog("error", "AUTHENTICATION FAILURE");
        throw new error.customError(error.ERRORS.AUTHENTICATION_FAILURE, 'Unable to login into your WebChart account. Make sure the credentials you provided are correct.');
    }

    //get Cookie
    let raw = res.headers['set-cookie'];
    raw = querystring.stringify(raw);
    cookie = raw.substring(raw.indexOf('id%') + 5, raw.indexOf('%3B')); //set cookie

    return cookie;

}

module.exports = { getCookie };