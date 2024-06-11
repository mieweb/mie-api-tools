const fs = require('fs');
const axios = require('axios');
const log = require('../../Logging/createLog');
const FormData = require('form-data');
const error = require('../../errors');
const { workerData, parentPort } = require('worker_threads');

//this function is used for multi-threading
async function uploadSingleDocument(filename, storageType, docType, patID, subject, service_location, service_date, URL, Cookie, Practice){

    const mrnumber = `MR-${patID}`;

    const form = new FormData();
    try {
        form.append('f', 'chart');
        form.append('s', 'upload');
        form.append('storage_type', storageType);
        form.append('service_date', service_date);
        form.append('service_location', service_location);
        form.append('doc_type', docType);
        form.append('subject', subject);
        form.append('file', fs.createReadStream(filename));
        form.append('pat_id', patID);
        form.append('mrnumber', mrnumber);
        form.append('interface', 'WC_DATA_IMPORT');
    } catch (err) {
        log.createLog("error", "Bad Request");
        throw new error.customError(error.CSV_PARSING_ERROR,  `There was an error parsing your CSV file. Make sure it is formatted correctly. Error: ${err}`);
    }

    log.createLog("info", `Document Upload Request:\nDocument Type: \"${docType}\"\nStorage Type: \"${storageType}\"\n Patient ID: ${patID}`);
    axios.post(URL, form, {
        headers: {
            'Content-Type': 'multi-part/form-data', 
            'cookie': `wc_miehr_${Practice}_session_id=${Cookie}`
        }
    })
    .then(response => {
        const result = response.headers['x-status'];
        if (result != 'success'){
            parentPort.postMessage({ success: false, filename: filename, result: response.headers['x-status_desc'] });
        } else {
            parentPort.postMessage({ success: true, filename: filename, result: response.headers['x-status_desc'] });
        } 
    })
    .catch((err) => {
        parentPort.postMessage({ success: 'error', filename: filename, result: err.message});
    });

}

uploadSingleDocument(workerData['row'].document_name, workerData['row'].storage_type, workerData['row'].doc_type, workerData['row'].pat_id, workerData['row'].subject, workerData['row'].service_location, workerData['row'].service_date, workerData['URL'], workerData['Cookie'], workerData['Practice']);