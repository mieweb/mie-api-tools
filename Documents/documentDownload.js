const session = require('../Session Management/getCookie');
const makeQuery = require('../Retrieve Records/tools');
const queryData = require('../Retrieve Records/getData.js');
const fs = require('fs');
const path = require('path');
const error = require('../errors');
const axios = require('axios');
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
async function retrieveSingleDoc(documentID, directory){

    cookie = session.getCookie();

    if (cookie != ""){

        if (Number.isInteger(documentID)){
            
            data = await makeQuery("documents", [], { doc_id: documentID });
            
            let last_name = "";
            let pat_id = null;
            let storage_type = "";

            data = data["db"]["0"];
            storage_type = getFileExtension(data);    
            pat_id = data["pat_id"];
            let last_name_data = await queryData.retrieveData("patients", ["last_name"], { pat_id: pat_id});
            last_name = last_name_data['0']["last_name"];

            const filename = `${last_name}_${documentID}.${storage_type}`;
            
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
            throw new error.customError(error.ERRORS.BAD_PARAMETER, '\"DocumentID\" must be of type int.');
        }

    }
}

//exports multiple documents to specified directory
async function retrieveDocs(queryString, directory){

    cookie = session.getCookie();

    if (cookie != ""){

        data = await makeQuery("documents", [], queryString);        
        let length = data["db"].length;
        documentIDArray = [];

        //iterate over all the documents returned
        for (i = 0; i < length; i++){
            documentIDArray.push(data["db"][i]["doc_id"]);     
        }

        for (j = 0; j < length; j++){
            retrieveSingleDoc(parseInt(documentIDArray[j]), directory);
        }

    } else {
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
              throw new Error(`There was an issue writing to ${filename}: ${error.message}`);
            }
            console.log(`File saved as ${filename}`);
          });
        } else {
          throw new Error(`Expected a 200 response but instead received a ${response.status}`);
        }
      })
      .catch(err => {
        throw new Error(`There was a bad request while trying to retrieve document ${doc_id}: ${err.message}`);
      });

}

function getFileExtension(data){
    return storageMap[data['storage_type']];
}


module.exports = { retrieveSingleDoc, retrieveDocs };