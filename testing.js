require('dotenv').config();
const fs = require('fs');
const documentImport = require('./Documents/documentExport')

const { URL, username, password } = require('./variables.js');
const queryData = require('./Get Requests/getData.js');

URL.value = "https://mieinternprac.webchartnow.com/webchart.cgi";
username.value = process.env.USERNAME;
password.value = process.env.PASSWORD;

// const results = queryData.retrieveData("documents", [], { doc_id: 29 });
// console.log(results);
// const jsonString = JSON.stringify(results);
// fs.appendFileSync('output.txt', jsonString);

documentImport.exportSingleDoc(29, "output_files");

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