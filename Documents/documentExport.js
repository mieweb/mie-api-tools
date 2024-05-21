const session = require('../Session Management/getCookie');
const makeQuery = require('../Get Requests/tools');
const queryData = require('../Get Requests/getData.js');
const fs = require('fs');
const request = require('request');
const path = require('path');
// const querystring = require('querystring');
const error = require('../errors');
const { URL } = require('../variables');

function exportSingleDoc(documentID, directory){

    cookie = session.getCookie();

    if (cookie != ""){

        if (Number.isInteger(documentID)){

            console.log("Getting Document");

            data = makeQuery("documents", [], { doc_id: documentID });

            const length = data["db"].length;
            let last_name = "";
            let pat_id = null;

            //find the exact document ID
            for (i = 0; i < length; i++){
                if (data["db"][i]["doc_id"] == documentID){
                    data = data["db"][i];                
                    pat_id = data["pat_id"];
                    last_name_data = queryData.retrieveData("patients", ["last_name"], { pat_id: pat_id});
                    last_name = last_name_data['0']["last_name"];
                    break;
                }
            };

            console.log("Downloading Document: " + documentID);
            
            const filename = `${last_name}_${documentID}.png`;
            
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
            console.error(error);
        } else if (response.statusCode == 200) {
            fs.writeFile(filename, body, (error) => {
                if (error){
                    console.error(error);
                } else {
                    console.log("File saved!");
                }
            });
            
        } else {
            throw new error.customError(error.ERRORS.STATUS_CODE_ERROR, `Expected a 200 response but instead received a ${response.statusCode} response.`);
        }
    });

}

module.exports = { exportSingleDoc };