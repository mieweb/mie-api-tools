const session = require('../Session Management/getCookie');
const fs = require('fs');
const { URL, practice, cookie } = require('../Variables/variables');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const log = require('../Logging/createLog');
const { Worker } = require('worker_threads');
const path = require('path');
const os = require("os");
const { pipeline } = require('stream/promises');
const stream = require('stream');

const success = [];
const errors = [];
const MAX_WORKERS = os.cpus().length;
const processedFiles = new Set(); 

// success file CSV writer
const successCSVWriter = createObjectCsvWriter({
    path: "./success.csv",
    header: [{ id: 'file', title: 'File' }, {id: 'patID', title: 'PatID'}, { id: 'status', title: 'Status'}],
    append: true
});

// error file CSV writer
const errorCSVWriter = createObjectCsvWriter({
    path: "./errors.csv",
    header: [{ id: 'file', title: 'File' }, {id: 'patID', title: 'PatID'}, { id: 'status', title: 'Status'}],
    append: true
});


//gather already-uploaded files
async function loadFiles(){
    if (fs.existsSync("./success.csv")){
        return new Promise((resolve, reject) => {
            fs.createReadStream("./success.csv")
                .pipe(csv())
                .on('data', (row) => {
                    if (row){
                        processedFiles.add(getKey({file: row.FILE, pat_id: row.PAT_ID}));
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        })
    }
}

function getKey(obj){
    return JSON.stringify(obj);
}

//import multiple documents through a CSV file
async function uploadDocs(csv_file){
    
    if (cookie.value == ""){
        await session.getCookie();
    }

    await loadFiles();
    const docQueue = [];

    await pipeline(
        fs.createReadStream(csv_file),
        csv(),
        new stream.Writable({
            objectMode: true,
            write(row, encoding, callback) {
                if (!processedFiles.has(getKey({file: row.document_name, pat_id: row.pat_id}))){
                    processedFiles.add(getKey({file: row.document_name, pat_id: row.pat_id}));
                    docQueue.push(row);
                }
                callback();
            }
        })
    );

    let workerPromises = [];

    for (i = 0; i < MAX_WORKERS; i++){
        const addWorker = new Promise((resolve) => {

            function newWorker(){
                const row = docQueue.shift();
                if (!row){
                   resolve();
                   return;
                }

                const worker = new Worker(path.join(__dirname, "/Parallelism/uploadDoc.js"), { workerData: {row: row, URL: URL.value, Cookie: cookie.value, Practice: practice.value}})
    
                worker.on('message', (message) => {
                    if (message.success == true){ 
                        console.log(`File \"${message.filename}\" was uploaded: ${message.result}`);
                        log.createLog("info", `Document Upload Response:\nFilename \"${message.filename}\" was successfully uploaded: ${message.result}`);
                        success.push({ file: row.document_name, patID: row.pat_id, status: 'Success'});
                        newWorker();
                    } else if (message.success == false) {
                        console.log(`File \"${message.filename}\" failed to upload: ${message.result}`)
                        log.createLog("info", `Document Upload Response:\nFilename \"${message.filename}\" failed to upload: ${message.result}`);
                        errors.push({ file: row.document_name, patID: row.pat_id, status: 'Failed Upload'})
                        newWorker();
                    } else {
                        console.log(`There was a bad request trying to upload \"${message.filename}\". Error: ` + message.result);
                        log.createLog("error", "Bad Request");
                        errors.push({ file: row.document_name, patID: row.pat_id, status: `Failed Upload - Bad Request: ${message.result}`})
                        newWorker();
                    }
                });
            }
            newWorker();
        })
        workerPromises.push(addWorker);
    }

    await Promise.all(workerPromises)
    console.log("All jobs have completed");

    //write results to appropriate CSV file
    if (!success.length == 0){
        await successCSVWriter.writeRecords(success);
    }
    if (!errors.length == 0){
        await errorCSVWriter.writeRecords(errors);
    }

    console.log(processedFiles);

}


module.exports = { uploadDocs };
