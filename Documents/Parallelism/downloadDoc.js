const queryData = require('../../Retrieve Records/getData.js');
const fs = require('fs');
const path = require('path');
const error = require('../../errors');
const axios = require('axios');
const log = require('../../Logging/createLog');
const { workerData, parentPort } = require('worker_threads');

const storageMap = {
    '0': 'txt',
    '1': 'txt', 
    '2': 'rtf',
    '3': 'png',
    '4': 'html',
    '5': 'html',
    '6': 'doc',
    '7': 'tif',
    '8': 'jpg',
    '9': 'bin',
    '10': 'dcm',
    '11': 'htm',
    '12': 'htm',
    '13': 'htm',
    '14': 'txt',
    '15': 'htm',
    '16': 'htm',
    '17': 'pdf',
    '18': 'xls',
    '19': 'cda',
    '20': 'avi',
    '21': 'ccr',
    '22': 'eml',
    '23': 'htm',
    '24': 'htm',
    '25': 'bmp',
    '26': 'x12',
    '27': 'xml'
}


//Multi-threaded version of downloadDoc
async function retrieveSingleDoc(documentID, directory, optimization = 0, pat_last_name = "", URL, Practice, Cookie, data){

    if (Number.isInteger(documentID)){
 
        let pat_id = null;
        let storage_type = "";

        data = data["db"]["0"];
        storage_type = getFileExtension(data, documentID);
        let filename = "";

        //optimization and avoids re-querying pat_id for some patient 
        if (optimization != 1){
            if (pat_last_name == ""){
                pat_id = data["pat_id"];
                let last_name_data = await queryData.retrieveRecord("patients", ["last_name"], { pat_id: pat_id});
                pat_last_name = last_name_data['0']["last_name"];
            }
            filename = `${pat_last_name}_${documentID}.${storage_type}`;
            
        } else {
            filename = `${documentID}.${storage_type}`;
        }
            
        
        //modify so this is only called if multi doc request isn't
        log.createLog("info", `Document Download Request:\nDocument ID: ${documentID}\nPatient Last Name: \"${pat_last_name}\"`);
        
        if (directory == ""){
            directory = "./";
        }

        const fileFullPath = path.join(directory, filename);
        const fileDirPath = path.dirname(fileFullPath);

        //make directory if one doesn't already exist
        if (!fs.existsSync(fileDirPath)){
            fs.mkdirSync(fileDirPath, { recursive: true} )
        }

        if (!fs.existsSync(fileFullPath)) {
            downloadDocument(Cookie, documentID, fileFullPath, URL, Practice);
        }

    } else {
        log.createLog("error", "Bad Request");
        throw new error.customError(error.ERRORS.BAD_PARAMETER, '\"DocumentID\" must be of type int.');
    }

}

function downloadDocument(Cookie, doc_id, filename, URL, Practice){

    const data_request_params = {
        'f': "stream",
        "doc_id": doc_id
    }

    //downloads the appropriate document from the server
    axios.post(URL, data_request_params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', //form encoded data
          'cookie': `wc_miehr_${Practice}_session_id=${Cookie}`
        },
        responseType: 'arraybuffer' // Handles binary data
      })
      .then(response => {
        if (response.status === 200) {
          fs.writeFile(filename, response.data, (error) => {
            if (error) {
                parentPort.postMessage({ success: false, doc_id: doc_id, err: error });
            }
            parentPort.postMessage({ success: true, filename: filename, doc_id: doc_id });
          });
        } else {
            parentPort.postMessage({ success: false, doc_id: doc_id, err: "Did not receive a 200 response status from the server." });
        }
      })
      .catch((err) => {
        parentPort.postMessage({ success: false, doc_id: doc_id, err: err });
      });

}

function getFileExtension(data, id){
    try {
        return storageMap[data['storage_type']];
    } catch (err) {
        log.createLog("error", "No File Found");
        throw new error.customError(error.ERRORS.BAD_REQUEST, `There was no file found with ID ${id}. Error: ${err}`);
    }
   
}

retrieveSingleDoc(parseInt(workerData['docID']), workerData['directory'], parseInt(workerData['optimization']), workerData['last_name'], workerData['URL'], workerData['Practice'], workerData['Cookie'], workerData['Data']);