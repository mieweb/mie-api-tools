const makeRequest = require('./getRequests');
const error = require('./errors');

require('dotenv').config();

//Patients Endpoint (Basic Demographics)
function accessData(field, endpoint, options){
    if (endpoint != ""){
        JSON = makeRequest.makeGETRequest(endpoint, options);
        try {
            return JSON['db'][0][field];
        } catch (e) {
            throw new error.customError(error.ERRORS.BAD_REQUEST, `The field ${field} does not exist at /${endpoint} with the options specified.`);
        }
    } else {
        throw new error.customError(error.ERRORS.EMPTY_PARAMETER, "\"endpoint\" parameter cannot be empty.")
    }
    
}

module.exports = { accessData }

