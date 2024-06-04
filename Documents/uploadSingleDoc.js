const session = require('../Session Management/getCookie');
const fs = require('fs');
const axios = require('axios');
const { URL, practice, cookie } = require('../Variables/variables');
const log = require('../Logging/createLog');
const FormData = require('form-data');
const { workerData, parentPort } = require('worker_threads');

async function uploadSingleDocument(filename, storageType, docType, patID, options = {subject: "", service_location: "", service_date: ""} ){

    console.log(URL.value);

    cookie.value = "5567dc99-e33a-4136-a6c6-d1ea25d07ec3";
    practice.value = "mieinternprac";
    URL.value = "https://mieinternprac.webchartnow.com/webchart.cgi";

    if (cookie.value == ""){
        await session.getCookie();
    }

    let subject = "subject" in options ? options["subject"] : "";
    let service_date = "service_date" in options ? options["service_date"] : "";
    let service_location = "service_location" in options ? options["service_location"] : "";

    const mrnumber = `MR-${patID}`;

    //console.log(storageType, service_date, service_location, docType, subject, filename, patID);

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
    axios.post(URL.value, form, {
        headers: {
            'Content-Type': 'multi-part/form-data', 
            'cookie': `wc_miehr_${practice.value}_session_id=${cookie.value}`
        }
    })
    .then(response => {
        const result = response.headers['x-status'];
        if (result != 'success'){
            //parentPort.postMessage({ success: true, filename, response: response});
        } else {
            parentPort.postMessage({ success: true, filename: filename, result: response.headers['x-status_desc'] });
        } 
    })
    .catch((err) => {
        console.error(err);
        //parentPort.postMessage({ success: false, filename, error: err.message});
    });

}

uploadSingleDocument(workerData[0], workerData[1], workerData[2], workerData[3], { subject: workerData[4], service_location: workerData[5], service_date: workerData[6]});