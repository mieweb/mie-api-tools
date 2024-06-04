const { URL, username, password } = require('../Variables/variables');
let { cookie } = require('../Variables/variables');
const querystring = require('querystring');
const error = require('../errors');
const axios = require('axios');
const log = require('../Logging/createLog');

//initializes user session and returns the cookie
function getCookie(){

    const encode_login_parms = {
        'login_user': username.value,
        'login_passwd': password.value
    }
    const encodedLoginParms = querystring.stringify(encode_login_parms);
    let fullURL = `${URL.value}?${encodedLoginParms}`

    //making the request

    return axios.get(fullURL)
    .then( (response) => {

        let status = (response.status).toString();

        if (status != 200){
            log.createLog("error", "AUTHENTICATION FAILURE");
            throw new error.customError(error.ERRORS.AUTHENTICATION_FAILURE, 'Unable to login into your WebChart account. Make sure the credentials you provided are correct.');
        }

        //get Cookie
        cookie.value = response.headers['x-lg_session_id'];

    })
    .catch ((err) => {
        log.createLog("error", "BAD REQUEST");
        throw new error.customError(error.ERRORS.BAD_REQUEST, 'A bad request was made in attempt to retrieve your session cookie. Error: ' + err);
    })


}

module.exports = { getCookie };