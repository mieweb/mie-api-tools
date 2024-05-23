require('dotenv').config();
const fs = require('fs');
const documentImport = require('./Documents/documentImport')
const documentExport = require('./Documents/documentExport');

const { URL, practice, username, password } = require('./variables.js');
const queryData = require('./Get Requests/getData.js');
const updateData = require('./Put Requests/requests_PUT');

URL.value = "https://mieinternprac.webchartnow.com/webchart.cgi";
practice.value = "mieinternprac";
username.value = process.env.USERNAME;
password.value = process.env.PASSWORD;



const json_data = {
    "first_name": "Maxwell",
    "last_name": "Klema"
}

updateData.makePUTRequest("patients", 18, json_data);
//updateData.test();

// const jsonString = JSON.stringify(results);
// fs.appendFileSync('output.txt', jsonString);

//documentExport.retrieveSingleDoc(719, "output_files");
//documentImport.retrieveDocs({ pat_id: 14 }, "output/new_files");

// documentImport.uploadSingleDocument("Hart_667.pdf", 17, "PATH", 18);
//documentImport.uploadDocs("filesToUpload.csv");

//console.log(queryData.retrieveData("observations", ["obs_result"], { }));
//console.log(queryData.retrieveData("documents", [], { storage_type: 17 }));

//console.log(queryData.retrieveData( "patient_partitions", [], { id: 35 }));
// endpoints = [ 

// ];


// for (i = 0; i < endpoints.length; i++){
//     fs.appendFileSync('output.txt', endpoints[i]);
//     fs.appendFileSync('output.txt', "\n");
//     result = queryData.retrieveData( endpoints[i], [], {  });
//     const jsonString = JSON.stringify(result);
//     fs.appendFileSync('output.txt', jsonString.substring(0, 8000));
//     fs.appendFileSync('output.txt', "\n");
// }