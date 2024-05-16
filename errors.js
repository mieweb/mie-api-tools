class customError extends Error{

    constructor(code, message){
        super(message);
        this.code = code;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

}

const ERRORS = {
    AUTHENTICATION_FAILURE: 'AUTHENTICATION_FAILURE'
};

module.exports = {ERRORS, customError};