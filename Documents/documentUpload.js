const session = require('../Session Management/getCookie');
const fs = require('fs');
const error = require('../errors');
const axios = require('axios');
const { URL, practice } = require('../Variables/variables');
const { parse } = require('csv-parse/sync');
const log = require('../Logging/createLog');

//function for importing a single document
function uploadSingleDocument(filename, storageType, docType, patID){

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
            'interface': 'WC_DATA_IMPORT'
        }

        log.createLog("info", `Document Upload Request:\nDocument Type: \"${docType}\"\nStorage Type: \"${storageType}\"\n Patient ID: ${patID}`);
        axios.post(URL.value, data_request_params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', //form encoded data
                'cookie': `wc_miehr_${practice.value}_session_id=${cookie}`
            }
        })
        .then(response => {
            const result = response.headers['x-status'];
            if (result != 'success'){
                log.createLog("info", `Document Upload Response:\nFilename \"${filename}\" failed to upload: ${response.headers['x-status_desc']}`);
            } else {
                log.createLog("info", `Document Upload Response:\nFilename \"${filename}\" was successfully uploaded: ${response.headers['x-status_desc']}`);
            } 
        })
        .catch(err => {
            log.createLog("error", "Bad Request");
            throw new error.customError(error.ERRORS.BAD_REQUEST, `There was a bad request while trying to retrieve document ${doc_id}. Error: ` + err);
        });

    } else {
        log.createLog("error", "Bad Request");
        throw new error.customError(error.ERRORS.BAD_REQUEST, '\"DocumentID\" must be of type int.');
    }

}

//import multiple documents through a CSV file
function uploadDocs(csv_file){

    csv_data_parsed = parseCSV(csv_file);
    const length = csv_data_parsed.length;

    //iterate over each document to upload
    for (i = 0; i < length; i++){
        uploadSingleDocument(csv_data_parsed[i]['document_name'], csv_data_parsed[i]['storage_type'], csv_data_parsed[i]['doc_type'], csv_data_parsed[i]['pat_id']);
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
        log.createLog("error", "Invalid CSV Headers");
        throw new error.customError(error.ERRORS.INVALID_CSV_HEADERS, `The headers in \"${csv_file}\" are not valid. They must be \'document_name\', \'pat_id\', \'doc_type\', and \'storage_type\'.`);
    }

    return results;

}

module.exports = { uploadSingleDocument, uploadDocs };
