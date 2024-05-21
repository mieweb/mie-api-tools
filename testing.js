require('dotenv').config();
const fs = require('fs');
const documentImport = require('./Documents/documentImport')
const documentExport = require('./Documents/documentExport');

const { URL, username, password } = require('./variables.js');
const queryData = require('./Get Requests/getData.js');

URL.value = "https://mieinternprac.webchartnow.com/webchart.cgi";
username.value = process.env.USERNAME;
password.value = process.env.PASSWORD;

// const jsonString = JSON.stringify(results);
// fs.appendFileSync('output.txt', jsonString);

//documentExport.exportSingleDoc(568, "output_files");
//documentImport.exportDocs({ pat_id: 14 }, "output/new_files");

documentImport.importSingleDocument("Hart_568.html", 4, "AUDIO", 18);

//console.log(queryData.retrieveData("documents", ["revision_date", "doc_type", "doc_id", "storage_type"], { pat_id: 18 }));

//console.log(queryData.retrieveData( "patients", ["first_name", "last_name", "ssn", "home_phone", "sex", "birth_date"], { first_name: "E"}));
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