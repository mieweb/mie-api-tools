class customError extends Error {

    constructor(code, message){
        super(message);
        this.code = code;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

}

const ERRORS = {
    AUTHENTICATION_FAILURE: 'AUTHENTICATION_FAILURE',
    INVALID_COOKIE: 'INVALID_COOKIE',
    BAD_REQUEST: 'BAD_REQUEST'
};

module.exports = {ERRORS, customError};