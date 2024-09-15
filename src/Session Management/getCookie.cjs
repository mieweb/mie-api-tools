const { URL, username, password } = require('../Variables/variables.cjs');
let { cookie } = require('../Variables/variables.cjs');
const querystring = require('querystring');
const error = require('../errors.cjs');
const axios = require('axios');
const log = require('../Logging/createLog.cjs');

//initializes user session and returns the cookie
async function getCookie(){

    const encode_login_parms = querystring.stringify({
        'login_post_redirect': '',
        'login_user': username.value,
        'login_passwd': password.value
    })

    let config = {
        method: 'post',
        maxBodtLength: Infinity,
        url: URL.value,
        data: encode_login_parms
    }

    return await axios.request(config)
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