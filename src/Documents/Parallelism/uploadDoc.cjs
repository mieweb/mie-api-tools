const fs = require('fs');
const axios = require('axios');
const log = require('../../Logging/createLog.cjs');
const FormData = require('form-data');
const error = require('../../errors.cjs');
const { workerData, parentPort } = require('worker_threads');

//this function is used for multi-threading
async function uploadSingleDocument(upload_data, URL, Cookie, Practice){

    let filename = upload_data['document_name'];

    //convert HTM and TIF file types
    if (filename.endsWith(".htm")){
        convertFile(4, ".html", 4);
     } else if (filename.endsWith(".tif") || filename.endsWith(".tiff")) {
        filename.endsWith(".tif") == true ? convertFile(4, ".png", 3) : convertFile(5, ".png", 3);
     }

    function convertFile(extension_length, new_extension, new_storage){
        fs.rename(filename, (filename.slice(0, filename.length - extension_length) + new_extension), (err) => {
            if (err) {
                console.error(err);
            }
        })
        storageType = new_storage;
        filename = filename.slice(0, filename.length - extension_length) + new_extension
    }

    const form = new FormData();
    try {
        if (upload_data['service_date'])
            form.append('service_date', upload_data['service_date']);
        
        if (upload_data['service_location'])
            form.append('service_location', upload_data['service_location']);
        
        if (upload_data['storage_type']) 
            form.append('storage_type', upload_data['storage_type']);
        
        if (upload_data['subject'])
            form.append('subject', upload_data['subject']);
        
        //required headers
        form.append('f', 'chart');
        form.append('s', 'upload');
        form.append('doc_type', upload_data['doc_type']);
        form.append('file', fs.createReadStream(filename));
        form.append('pat_id', upload_data['pat_id']);
        form.append('interface', 'WC_DATA_IMPORT');

        if (upload_data['mrnumber']) {
            form.append('mrnumber', upload_data['mrnumber']);
        } else {
            form.append('mrnumber', `MR-${upload_data['pat_id']}`);
        }

    } catch (err) {
        log.createLog("error", "Bad Request");
        throw new error.customError(error.CSV_PARSING_ERROR,  `There was an error parsing your CSV file. Make sure it is formatted correctly. Error: ${err}`);
    }

    log.createLog("info", `Document Upload Request:\nDocument Type: \"${upload_data['doc_type']}\"\nStorage Type: \"${upload_data['storage_type']}\"\n Patient ID: ${upload_data['pat_id']}`);
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

uploadSingleDocument(workerData['row'], workerData['URL'], workerData['Cookie'], workerData['Practice']);