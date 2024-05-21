const session = require('../Session Management/getCookie');
const makeQuery = require('../Get Requests/tools');
const queryData = require('../Get Requests/getData.js');
const fs = require('fs');
// const request = require('sync-request');
// const querystring = require('querystring');
// const error = require('../errors');
// const { URL } = require('../variables');

function exportSingleDoc(documentID){

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
            downloadDocument(doc_id, last_name + "_" + doc_id + ".xml");


        } else {
            throw new error.customError(error.ERRORS.BAD_PARAMETER, '\"DocumentID\" must be of type int.');
        }

    }
}

function downloadDocument(doc_id, filename){
    



}

module.exports = { exportSingleDoc };