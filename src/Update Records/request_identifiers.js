const error = require('../errors');
const log = require('../Logging/createLog');
const { identifiers } = require('../Variables/endpointLists');

function verify_identifier(endpoint, identifier) {

  if (identifiers[endpoint]){
      
      const valid_identifier = identifiers[endpoint];

      //verify
      if (valid_identifier != Object.keys(identifier)[0]){
        log.createLog("error", "Invalid Identifier");
        throw new error.customError(error.ERRORS.INVALID_IDENTIFIER, `You used an incorrect identifier on the \"${endpoint}\" endpoint. Expected \"${identifiers[endpoint]}\" but instead got \"${Object.keys(identifier)[0]}.\"`);
      }
  
  }
  
}

module.exports = { verify_identifier };