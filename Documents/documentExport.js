const session = require('../Session Management/getCookie');
const makeQuery = require('../Get Requests/tools');
const queryData = require('../Get Requests/getData.js');
const fs = require('fs');
const request = require('request');
const path = require('path');
const error = require('../errors');
const { URL } = require('../variables');

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
function exportSingleDoc(documentID, directory){

    cookie = session.getCookie();

    if (cookie != ""){

        if (Number.isInteger(documentID)){

            data = makeQuery("documents", [], { doc_id: documentID });
            const length = data["db"].length;
            let last_name = "";
            let pat_id = null;
            let storage_type = "";

            //find the exact document ID
            for (i = 0; i < length; i++){
                if (data["db"][i]["doc_id"] == documentID){
                    data = data["db"][i];
                    storage_type = getFileExtension(data);    
                    pat_id = data["pat_id"];
                    last_name_data = queryData.retrieveData("patients", ["last_name"], { pat_id: pat_id});
                    last_name = last_name_data['0']["last_name"];
                    break;
                }
            };
            
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
function exportDocs(queryString, directory){

    cookie = session.getCookie();

    if (cookie != ""){

        data = makeQuery("documents", [], queryString);
        const length = data["db"].length;

        documentIDArray = [];

        //iterate over all the documents returned
        for (i = 0; i < length; i++){
            documentIDArray.push(data["db"][i]["doc_id"]);     
        }

        for (j = 0; j < length; j++){
            exportSingleDoc(parseInt(documentIDArray[j]), directory);
        }

    } else {
        throw new error.customError(error.INVALID_COOKIE, 'Your session cookie was invalid. Make sure your login credentials are correct.');
    }

}

function downloadDocument(cookie, doc_id, filename){

    const data_request_params = {
        'f': "stream",
        "doc_id": doc_id,
        "session_id": cookie,
        "rawdata": '1'
    }

    const requestURL = URL.value;

    request.post({url: requestURL, form: data_request_params, encoding: null}, (error, response, body) => {
        if (error){
            throw new error.customError(error.BAD_REQUEST, `There was a bad request while trying to retrieve document ${doc_id}.`);
        } else if (response.statusCode == 200) {
            fs.writeFile(filename, body, (error) => {
                if (error){
                    throw new error.customError(error.WRITE_ERROR, `There was an issue writing to ${filename}.`);
                }
            });
            
        } else {
            throw new error.customError(error.ERRORS.STATUS_CODE_ERROR, `Expected a 200 response but instead received a ${response.statusCode} response.`);
        }
    });

}

function getFileExtension(data){
    return storageMap[data['storage_type']];
}


module.exports = { exportSingleDoc, exportDocs };