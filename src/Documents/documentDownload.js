const session = require('../Session Management/getCookie');
const makeQuery = require('../Retrieve Records/tools');
const queryData = require('../Retrieve Records/getData.js');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const log = require('../Logging/createLog');
const { URL, practice, cookie } = require('../Variables/variables');
const { Worker } = require('worker_threads');
const os = require("os");
const { error } = require('console');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const success = [];
const errors = [];
const processedFiles = new Set(); 

// success file CSV writer
const successCSVWriter = createCsvWriter({
    path: './Download Status/success.csv',
    header: [
        {id: 'file', title: 'FILE'},
        {id: 'docID', title: 'DOC_ID'},
        {id: 'status', title: 'STATUS'}
    ],
    append: true
});

// Error file CSV Writer
const errorCSVWriter = createCsvWriter({
    path: './Download Status/errors.csv',
    header: [
        {id: 'file', title: 'FILE'},
        {id: 'docID', title: 'DOC_ID'},
        {id: 'status', title: 'STATUS'}
    ],
    append: true
});

//create new directory to store job statuses
if (!fs.existsSync("./Download Status")){
    fs.mkdirSync("./Download Status", { recursive: true} )
}

if (!fs.existsSync("./Download Status/errors.csv")){
    fs.writeFile("./Download Status/errors.csv", "FILE,DOC_ID,STATUS\n", 'utf8', () => {});
}

async function checkDownloadedFiles(){
    if (fs.existsSync("./Download Status/success.csv")){
        return new Promise((resolve, reject) => {
            fs.createReadStream("./Download Status/success.csv")
                .pipe(csv())
                .on('data', (row) => processedFiles.add(row.DOC_ID))
                .on('end', resolve)
                .on('error', reject)
        });
    
    } else {
        fs.writeFile("./Download Status/success.csv", "FILE,DOC_ID,STATUS\n", 'utf8', () => {});
    }
}

//exports multiple documents to specified directory
async function retrieveDocs(queryString, directory, optimization = 0){

    let data = await makeQuery("documents", [], queryString);        
    let length = data["db"].length;
    let documentIDArray = [];
    let pat_last_name = "";
    const MAX_WORKERS = 1//os.cpus().length;
    let workerPromises = [];
    await checkDownloadedFiles();

    if (cookie.value == ""){
        await session.getCookie();
    }

    //iterate over all the documents returned
    for (i = 0; i < length; i++){
        documentIDArray.push(data["db"][i]["doc_id"]);     
    }

    //check if query is for pat_id
    if ((Object.keys(queryString).length == 1 && queryString["pat_id"]) && optimization == 0){
        let last_name_data = await queryData.retrieveRecord("patients", ["last_name"], { pat_id: queryString["pat_id"]});
        pat_last_name = last_name_data['0']["last_name"];
    }

    log.createLog("info", `Multi-Document Download Request:\nDocument IDs: ${documentIDArray}`);

    for (i = 0; i < MAX_WORKERS; i++){

        const addWorker = new Promise(async (resolve) => {

            async function doWork() {

                const download_doc = documentIDArray.shift();
                if (!download_doc) {
                    resolve();
                    return;
                }
                if (processedFiles.has(download_doc)) {
                    console.log("here?" + download_doc);
                    processedFiles.add(download_doc);
                    doWork();
                }

                data = await makeQuery("documents", [], {doc_id: download_doc});
                pat_last_name = "";

                if (optimization != 1 && pat_last_name == ""){
                    pat_id = data['db']['0']["pat_id"];
                    let last_name_data = await queryData.retrieveRecord("patients", ["last_name"], { pat_id: pat_id});
                    pat_last_name = last_name_data['0']["last_name"];
                }

                const worker = new Worker(path.join(__dirname, "/Parallelism/downloadDoc.js"), { workerData: {docID: download_doc, directory: directory, optimization: optimization, last_name: pat_last_name, URL: URL.value, Practice: practice.value, Cookie: cookie.value, Data: data}})

                worker.on(('message'), (message) => {
                    if (message.success){
                        console.log(`File \"${message.filename}\" was downloaded.`);
                        log.createLog("info", `Document Download Response:\nDocument ${message.doc_id} Successfully saved to \"${message.filename}\"`);
                        success.push({ file: message.filename, docID: download_doc, status: 'SUCCESS'});
                        doWork();
                    } else {
                        log.createLog("error", "Bad Request");
                        success.push({ file: message.filename, docID: download_doc, status: `There was a bad request while trying to retrieve document ${message.doc_id}`});
                        doWork();
                    }
                });
            }
            doWork();
        });
        workerPromises.push(addWorker);
    }

    await Promise.all(workerPromises);
    console.log("Download Document Job Completed.");

    //write results to appropriate CSV file
    if (success.length != 0){
        successCSVWriter.writeRecords(success);
    }
    if (errors.length != 0){
        errorCSVWriter.writeRecords(errors);  
    }
}

module.exports = { retrieveDocs };