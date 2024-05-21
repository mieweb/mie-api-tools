const session = require('../Session Management/getCookie');
const makeQuery = require('../Get Requests/tools');
const queryData = require('../Get Requests/getData.js');
const fs = require('fs');
const request = require('request');
const path = require('path');
const error = require('../errors');
const { URL } = require('../variables');

const storageMap = {
    '0': 'txt',
    '1': 'txt', 
    '2': 'rtf',
    '3': 'png',
    '4': 'html',
    '5': 'html',
    '6': 'doc',
    '7': 'tif',
    '8': 'jpg',
    '9': 'bin',
    '10': 'dcm',
    '11': 'htm',
    '12': 'htm',
    '13': 'htm',
    '14': 'txt',
    '15': 'htm',
    '16': 'htm',
    '17': 'pdf',
    '18': 'xls',
    '19': 'cda',
    '20': 'avi',
    '21': 'ccr',
    '22': 'mime',
    '23': 'htm',
    '24': 'htm',
    '25': 'bmp',
    '26': 'x12',
    '27': 'xml'
}

//function for importing a single document
function importSingleDocument(filename, storageType, docType, patID){

    cookie = session.getCookie();

    if (cookie != ""){

        const mrnumber = `MR-${patID}`;
        
        const data_request_params = {
            'f': 'chart',
            's': 'upload',
            'storage_type': storageType,
            'doc_type': docType,
            'file': fs.readFileSync(filename),
            'pat_id': patID,
            'mrnumber': mrnumber,
            'session_id': cookie
        }

        request.post({url: URL.value, form: data_request_params, encoding: null}, (error, response, body) => {
            if (error){
                throw new error.customError(error.BAD_REQUEST, `There was a bad request while trying to retrieve document ${doc_id}.`);
            } else {
                console.log(response.statusCode);              
            }
        });


    } else {
        throw new error.customError(error.ERRORS.BAD_PARAMETER, '\"DocumentID\" must be of type int.');
    }

}

module.exports = { importSingleDocument };
