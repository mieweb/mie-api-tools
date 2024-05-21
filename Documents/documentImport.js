const session = require('../Session Management/getCookie');
const makeQuery = require('../Get Requests/tools');
const queryData = require('../Get Requests/getData.js');
const fs = require('fs');
const request = require('request');
const path = require('path');
const error = require('../errors');
const { URL } = require('../variables');
const { parse } = require('csv-parse/sync');

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
                throw new error.customError(error.ERRORS.BAD_REQUEST, `There was a bad request while trying to retrieve document ${doc_id}.`);
            } else {
                const result = response.headers['x-status'];
                if (result != 'success'){
                    console.log(`File \"${filename}\" failed to upload: ${response.headers['x-status_desc']}`);
                } else {
                    console.log(`File \"${filename}\" was uploaded: ${response.headers['x-status_desc']}`);
                }            
            }
        });

    } else {
        throw new error.customError(error.ERRORS.BAD_REQUEST, '\"DocumentID\" must be of type int.');
    }

}

//import multiple documents through a CSV file
function importDocs(csv_file){

    csv_data_parsed = parseCSV(csv_file);
    const length = csv_data_parsed.length;

    //iterate over each document to upload
    for (i = 0; i < length; i++){
        importSingleDocument(csv_data_parsed[i]['document_name'], csv_data_parsed[i]['storage_type'], csv_data_parsed[i]['doc_type'], csv_data_parsed[i]['pat_id']);
    }

}

//parses CSV data and returns an array
function parseCSV(csv_file) {

    validHeaders = ['document_name', 'pat_id', 'doc_type', 'storage_type'];

    //Sync operation
    const csv_raw_data = fs.readFileSync(csv_file, 'utf8');
    const results = parse(csv_raw_data, {
        columns: true,
        skip_empty_lines: true
    });

    const headers = Object.keys(results[0]);
    const headersValid = validHeaders.every(header => headers.includes(header));
    if (!headersValid){ //invalid CSV headers
        throw new error.customError(error.ERRORS.INVALID_CSV_HEADERS, `The headers in \"${csv_file}\" are not valid. They must be \'document_name\', \'pat_id\', \'doc_type\', and \'storage_type\'.`);
    }

    return results;

}

module.exports = { importSingleDocument, importDocs };
