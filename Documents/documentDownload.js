const session = require('../Session Management/getCookie');
const makeQuery = require('../Retrieve Records/tools');
const queryData = require('../Retrieve Records/getData.js');
const fs = require('fs');
const path = require('path');
const error = require('../errors');
const axios = require('axios');
const log = require('../Logging/createLog');
const { URL, practice } = require('../variables');

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
    '22': 'mime',
    '23': 'htm',
    '24': 'htm',
    '25': 'bmp',
    '26': 'x12',
    '27': 'xml'
}


//exports a single document to specified directory
async function retrieveSingleDoc(documentID, directory, pat_last_name = "", optimization = 0){

    cookie = session.getCookie();

    if (cookie != ""){

        if (Number.isInteger(documentID)){
            
            data = await makeQuery("documents", [], { doc_id: documentID });
            
            let last_name = "";
            let pat_id = null;
            let storage_type = "";

            data = data["db"]["0"];
            storage_type = getFileExtension(data);
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
                downloadDocument(cookie, documentID, fileFullPath);
            }

        } else {
            log.createLog("error", "Bad Request");
            throw new error.customError(error.ERRORS.BAD_PARAMETER, '\"DocumentID\" must be of type int.');
        }

    }
}

//exports multiple documents to specified directory
async function retrieveDocs(queryString, directory, optimization = 0){

    cookie = session.getCookie();

    if (cookie != ""){

        data = await makeQuery("documents", [], queryString);        
        let length = data["db"].length;
        documentIDArray = [];

        //iterate over all the documents returned
        for (i = 0; i < length; i++){
            documentIDArray.push(data["db"][i]["doc_id"]);     
        }

        let pat_last_name = "";

        //check if query is for pat_id
        if ((Object.keys(queryString).length == 1 && queryString["pat_id"]) && optimization == 0){
            let last_name_data = await queryData.retrieveRecord("patients", ["last_name"], { pat_id: queryString["pat_id"]});
            pat_last_name = last_name_data['0']["last_name"];
        }

        log.createLog("info", `Multi-Document Download Request:\nDocument IDs: ${documentIDArray}`);

        for (j = 0; j < length; j++){
            retrieveSingleDoc(parseInt(documentIDArray[j]), directory, pat_last_name, optimization);
        }

    } else {
        log.createLog("error", "Invalid Cookie");
        throw new error.customError(error.INVALID_COOKIE, 'Your session cookie was invalid. Make sure your login credentials are correct.');
    }

}

function downloadDocument(cookie, doc_id, filename){

    const data_request_params = {
        'f': "stream",
        "doc_id": doc_id
    }

    //dowenloads the appropriate document from the server
    axios.post(URL.value, data_request_params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', //form encoded data
          'cookie': `wc_miehr_${practice.value}_session_id=${cookie}`
        },
        responseType: 'arraybuffer' // Handles binary data
      })
      .then(response => {
        if (response.status === 200) {
          fs.writeFile(filename, response.data, (error) => {
            if (error) {
                log.createLog("error", "Write Error");
                throw new error.customError(error.ERRORS.WRITE_ERROR,`There was an issue writing to ${filename}: ${error.message}`);
            }
            log.createLog("info", `Document Download Response:\nDocument ${doc_id} Successfully saved to \"${filename}\"`);
          });
        } else {
            log.createLog("error", "Bad Request");
            throw new error.customError(error.ERRORS.BAD_REQUEST, `Expected a 200 response but instead received a ${response.status}`);
        }
      })
      .catch(err => {
        log.createLog("error", "Bad Request");
        throw new error.customError(error.ERRORS.BAD_REQUEST, `There was a bad request while trying to retrieve document ${doc_id}: ${err.message}`);
      });

}

function getFileExtension(data){
    return storageMap[data['storage_type']];
}


module.exports = { retrieveSingleDoc, retrieveDocs };