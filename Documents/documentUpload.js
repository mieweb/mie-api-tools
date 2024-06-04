const session = require('../Session Management/getCookie');
const fs = require('fs');
const error = require('../errors');
const axios = require('axios');
const { URL, practice, cookie } = require('../Variables/variables');
const { parse } = require('csv-parse/sync');
const log = require('../Logging/createLog');
const FormData = require('form-data');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');

//function for importing a single document
async function uploadSingleDocument(filename, storageType, docType, patID, options = {subject: "", service_location: "", service_date: ""} ){

    if (cookie.value == ""){
        await session.getCookie();
    }

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
    axios.post(URL.value, form, {
        headers: {
            'Content-Type': 'multi-part/form-data', 
            'cookie': `wc_miehr_${practice.value}_session_id=${cookie.value}`
        }
    })
    .then(response => {
        const result = response.headers['x-status'];
        if (result != 'success'){
            parentPort.postMessage({ success: false, filename, response: resonse});
        } else {
            parentPort.postMessage({ success: true, filename, response: response});
        } 
    })
    .catch(err => {
        parentPort.postMessage({ success: false, filename, error: err.message});
    });

}

//import multiple documents through a CSV file
function uploadDocs(csv_file){

    const MAX_WORKERS = 8;

    csv_data_parsed = parseCSV(csv_file);
    const length = csv_data_parsed.length;
    let docsToUpload = [];

    //iterate over each document to upload
    for (i = 0; i < length; i++){
        docsToUpload.push([csv_data_parsed[i]['document_name'], csv_data_parsed[i]['storage_type'], csv_data_parsed[i]['doc_type'], csv_data_parsed[i]['pat_id'], csv_data_parsed[i]['subject'], csv_data_parsed[i]['service_location'], csv_data_parsed[i]['service_date']]);
    }

    let activeWorkers = 0;
    let index = 0;

    function createWorker() {

        if (index >= docsToUpload.length) {
            return;
        }
    
        const file_information = docsToUpload[index];
        
        index++;
        activeWorkers++;

        const worker = new Worker(path.join(__dirname, "uploadSingleDoc.js"), { workerData: file_information });

        worker.on('message', (message) => {
            console.log(message.success);
            if (message.success){
                console.log(`File \"${message.filename}\" was uploaded: ${message.result}`);
                log.createLog("info", `Document Upload Response:\nFilename \"${message.filename}\" was successfully uploaded: ${message.result}`);
            } else {
                console.log(`File \"${message.filename}\" failed to upload: ${message.response}`);
                log.createLog("info", `Document Upload Response:\nFilename \"${message.filename}\" failed to upload: ${message.response}`);
            }
            activeWorkers--
            createWorker();
        });

        worker.on('error', (err) => {
            log.createLog("error", "Bad Request");
            throw new error.customError(error.ERRORS.BAD_REQUEST, `There was a bad request trying to upload \"${err.filename}\". Error: ` + err);
        })
    }

    for (i = 0; i < MAX_WORKERS; i++){
        createWorker();
    }

}

//parses CSV data and returns an array
function parseCSV(csv_file) {

    validHeaders = ['document_name', 'pat_id', 'doc_type', 'storage_type', 'subject', 'service_location', 'service_date'];

    //Sync operation
    const csv_raw_data = fs.readFileSync(csv_file, 'utf8');
    let results;
    try {
        results = parse(csv_raw_data, {
            columns: true,
            skip_empty_lines: true
        });
    } catch (err) {
        log.createLog("error", "Invalid CSV Headers");
        throw new error.customError(error.ERRORS.INVALID_CSV_HEADERS, `The headers in \"${csv_file}\" are not valid. They must be \'document_name\', \'pat_id\', \'doc_type\', and \'storage_type\'.`);
    }
    
    const headers = Object.keys(results[0]);
    const headersValid = validHeaders.every(header => headers.includes(header));
    if (!headersValid){ //invalid CSV headers
        log.createLog("error", "Invalid CSV Headers");
        throw new error.customError(error.ERRORS.INVALID_CSV_HEADERS, `The headers in \"${csv_file}\" are not valid. They must be \'document_name\', \'pat_id\', \'doc_type\', and \'storage_type\'.`);
    }

    return results;

}

module.exports = { uploadSingleDocument, uploadDocs };
