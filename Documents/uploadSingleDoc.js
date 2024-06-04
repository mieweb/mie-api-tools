const session = require('../Session Management/getCookie');
const fs = require('fs');
const axios = require('axios');
const log = require('../Logging/createLog');
const FormData = require('form-data');
const { workerData, parentPort } = require('worker_threads');

//this function is used for multi-threading
async function uploadSingleDocument(filename, storageType, docType, patID, options = {subject: "", service_location: "", service_date: ""},  URL, Cookie, Practice){

    let subject = "subject" in options ? options["subject"] : "";
    let service_date = "service_date" in options ? options["service_date"] : "";
    let service_location = "service_location" in options ? options["service_location"] : "";

    const mrnumber = `MR-${patID}`;

    const form = new FormData();
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

uploadSingleDocument(workerData['files'][0], workerData['files'][1], workerData['files'][2], workerData['files'][3], { subject: workerData['files'][4], service_location: workerData['files'][5], service_date: workerData['files'][6]}, workerData['URL'], workerData['Cookie'], workerData['Practice']);