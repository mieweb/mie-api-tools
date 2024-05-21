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
    BAD_REQUEST: 'BAD_REQUEST',
    EMPTY_PARAMETER: 'EMPTY_PARAMETER',
    INVALID_FIELD: 'INVALID_FIELD',
    INVALID_ENDPOINT: 'INVALID_ENDPOINT',
    BAD_PARAMETER: 'BAD_PARAMETER'
};

module.exports = { ERRORS, customError };