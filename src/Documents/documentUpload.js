const session = require('../Session Management/getCookie');
const fs = require('fs');
const error = require('../errors');
const axios = require('axios');
const { URL, practice, cookie } = require('../Variables/variables');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const log = require('../Logging/createLog');
const FormData = require('form-data');
const { Worker, workerData } = require('worker_threads');
const path = require('path');
const os = require("os");
const { pipeline } = require('stream/promises');
const stream = require('stream');
const EventEmitter = require('events');

const success = [];
const errors = [];
const document_queue = []
const emitter = new EventEmitter();
//const processedFiles = new Set(); 

// success file CSV writer
const successCSVWriter = createObjectCsvWriter({
    path: "",
    header: [{ id: 'file', title: 'File' }, {id: 'patID', title: 'PatID'}, { id: 'status', title: 'Status'}],
    append: true
});

// error file CSV writer
const errorCSVWriter = createObjectCsvWriter({
    path: "",
    header: [{ id: 'file', title: 'File' }, {id: 'patID', title: 'PatID'}, { id: 'status', title: 'Status'}],
    append: true
});

emitter.on('queueUpdate', () => {
    console.log(document_queue.length);
});

//function for uploading a single document
async function uploadDoc(row){

    // let subject = "subject" in options ? options["subject"] : "";
    // let service_date = "service_date" in options ? options["service_date"] : "";
    // let service_location = "service_location" in options ? options["service_location"] : "";

    // const mrnumber = `MR-${patID}`;

    // const form = new FormData();
    // form.append('f', 'chart');
    // form.append('s', 'upload');
    // form.append('storage_type', storageType);
    // form.append('service_date', service_date);
    // form.append('service_location', service_location);
    // form.append('doc_type', docType);
    // form.append('subject', subject);
    // form.append('file', fs.createReadStream(filename));
    // form.append('pat_id', patID);
    // form.append('mrnumber', mrnumber);
    // form.append('interface', 'WC_DATA_IMPORT');

    // log.createLog("info", `Document Upload Request:\nDocument Type: \"${docType}\"\nStorage Type: \"${storageType}\"\n Patient ID: ${patID}`);
    // axios.post(URL.value, form, {
    //     headers: {
    //         'Content-Type': 'multi-part/form-data', 
    //         'cookie': `wc_miehr_${practice.value}_session_id=${cookie.value}`
    //     }
    // })
    // .then(response => {
    //     const result = response.headers['x-status'];
    //     if (result != 'success'){
    //         console.log(`File \"${filename}\" failed to upload: ${response.headers['x-status_desc']}`);
    //         log.createLog("info", `Document Upload Response:\nFilename \"${filename}\" failed to upload: ${response.headers['x-status_desc']}`);
    //     } else {
    //         console.log(`File \"${filename}\" was uploaded: ${response.headers['x-status_desc']}`);
    //         log.createLog("info", `Document Upload Response:\nFilename \"${filename}\" was successfully uploaded: ${response.headers['x-status_desc']}`);
    //     } 
    // })
    // .catch(err => {
    //     log.createLog("error", "Bad Request");
    //     throw new error.customError(error.ERRORS.BAD_REQUEST, `There was a bad request trying to upload \"${filename}\". Error: ` + err);
    // });
    

    //console.log(row);

}

async function worker(){

    
    while (true) {

        // setTimeout( () => 
        //     console.log(document_queue)
        // , 1000);
        console.log(document_queue.length);
        //const row = document_queue.shift();

        //await uploadDoc(row);
    }


}

async function readStream() {
    await pipeline(
        fs.createReadStream("files_many.csv"),
        csv(),
        new stream.Writable({
            objectMode: true,
            write(row, encoding, callback) {
                document_queue.push(row);
                emitter.emit('queueUpdate');
                callback();
            }
        })
    );

}

//import multiple documents through a CSV file
async function uploadDocs(csv_file){

    // // if (cookie.value == ""){
    // //     await session.getCookie();
    // // }

    // passed by reference, continuously updated
    // const worker_threads = [];

    // for (let i = 0; i < 1; i++){
    //     worker_threads.push(worker(document_queue, i));
    // }



    // const csvStream = fs.createReadStream(csv_file)
    //     .pipe(csv())
    //     .on('data', (row) => {
    //         document_queue.push(row);
    //     })
    //     .on('end', () => {
    //         console.log("CSV processing complete");
    //     })

    // console.log(document_queue);

    //await Promise.all(worker_threads);

    await readStream();

    console.log("REST OF QUEUE: " + document_queue.length);

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

module.exports = { uploadDocs };
