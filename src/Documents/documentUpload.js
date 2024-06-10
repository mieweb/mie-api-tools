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

const success = [];
const errors = [];
const MAX_WORKERS = 8;
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

//import multiple documents through a CSV file
async function uploadDocs(csv_file){
    
    if (cookie.value == ""){
        await session.getCookie();
    }

    const docQueue = [];

    await pipeline(
        fs.createReadStream(csv_file),
        csv(),
        new stream.Writable({
            objectMode: true,
            write(row, encoding, callback) {
                docQueue.push(row);
                callback();
            }
        })
    );

    const workerPromises = [];

    for (i = 0; i < MAX_WORKERS; i++){

        const addWorker = new Promise((resolve, reject) => {

            const row = docQueue.shift();

            const worker = new Worker(path.join(__dirname, "/Parallelism/uploadDoc.js"), { workerData: {row: row, URL: URL.value, Cookie: cookie.value, Practice: practice.value}})
        
            worker.on('message', (message) => {
                if (message.success == true){ 
                    console.log(`File \"${message.filename}\" was uploaded: ${message.result}`);
                    log.createLog("info", `Document Upload Response:\nFilename \"${message.filename}\" was successfully uploaded: ${message.result}`);
                    resolve();
                } else if (message.success == false) {
                    console.log(`File \"${message.filename}\" failed to upload: ${message.result}`)
                    log.createLog("info", `Document Upload Response:\nFilename \"${message.filename}\" failed to upload: ${message.result}`);
                    resolve();
                } else {
                    log.createLog("error", "Bad Request");
                    reject(new error.customError(error.ERRORS.BAD_REQUEST, `There was a bad request trying to upload \"${message.filename}\". Error: ` + message.result));
                }
            });
        
        })

        workerPromises.push(addWorker);
    }

    await Promise.all(workerPromises)
    console.log("all workers have completed");

}


module.exports = { uploadDocs };
