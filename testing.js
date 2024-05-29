require('dotenv').config();
const fs = require('fs');
const documentImport = require('./Documents/documentUpload')
const documentExport = require('./Documents/documentDownload');

const { URL, practice, username, password, logging } = require('./variables.js');
const queryData = require('./Retrieve Records/getData.js');
const updateData = require('./Update Records/requests_PUT');
const newData = require('./Create Records/requests_POST');
const ledger = require('./Logging/createLedger');

URL.value = "https://mieinternprac.webchartnow.com/webchart.cgi";
practice.value = "mieinternprac";
username.value = process.env.USERNAME;//"Max"
password.value = process.env.PASSWORD;

logging.value = "true";

const options = {
    "levels": ["error", "info"],
    "format": ["levels", "timestamps"],
    "storage": ["Logs/info.log", "Logs/error.log"]
}

ledger.createLedger(options);

const json_data = {
    "first_name": "Courtney",
    "last_name": "K.",
    "middle_name": "Rogers",
    "ssn": "3294802394",
    "address": "1509 Pinetrace Street, Fort Wayne, Indiana, 46824"
}

//newData.createRecord("patients", json_data);

// data = "lorem ipsuim,"
// fs.writeFile("Logs/error.log", data, (err) => {
//     if (err){
//         console.error(err);
//     }
// })

// function hello(){
//     console.log("hello!");
// }

// const timeoutId = setTimeout(hello, 2354);

//updateData.makePUTRequest("patients", { pat_id: 18}, json_data);
//updateData.test();

// const jsonString = JSON.stringify(results);
// fs.appendFileSync('output.txt', jsonString);

//documentExport.retrieveSingleDoc(29, "output_files");
documentExport.retrieveDocs({ storage_type: 8 }, "output_files", 0);

//documentImport.uploadSingleDocument("Hart_667.pdf", 17, "PATH", 18);
//documentImport.uploadDocs("filesToUpload.csv");

async function runnerFunction() {
    //updateData.updateRecord("obs_forms", {obs_item_id: "34"}, json_data);

    //await queryData.retrieveRecord("documents", ["storage_type"], { storage_type: 8 });

    //await queryData.retrieveRecord("patients", ["first_name", "last_name", "ssn", "address1", "address2", "address3"], { pat_id: 19 });
    // await queryData.retrieveRecord("patients", ["first_name", "last_name", "ssn"], { pat_id: 20 });
    // await queryData.retrieveRecord("patients", ["first_name", "last_name", "ssn"], { pat_id: 21 });
    // console.log(await queryData.retrieveRecord("patients", [], { pat_id: 14 }));
    //await documentExport.retrieveDocs({ pat_id: 6 }, "output");
}

runnerFunction();

// console.log("here!");

// result = await queryData.retrieveData("patients", [], { pat_id: 18 });
// console.log(result);


//console.log(queryData.retrieveData("documents", [], { storage_type: 17 }));

//console.log(queryData.retrieveData( "patient_partitions", [], { id: 35 }));
// endpoints = [ 

// ];

//https://mieinternprac.webchartnow.com/webchart.cgi?apistring=R0VUL2RiL2RvY3VtZW50cy9MSUtFX3N0b3JhZ2VfdHlwZT0xNw%3D%3D&session_id=ff3ed316-8d7f-4716-b08c-69fbd0e3ac83&f=json

// fetch()
// .then( res => {
//     console.log(res);
// })
// .catch( err => {
//     console.error(err);
// });

// axios.get("https://mieinternprac.webchartnow.com/webchart.cgi?apistring=R0VUL2RiL2RvY3VtZW50cy9MSUtFX3N0b3JhZ2VfdHlwZT0xNw%3D%3D&session_id=ff3ed316-8d7f-4716-b08c-69fbd0e3ac83&f=json")
//   .then((response) => {
//     console.log("here??");
//     console.log(response.data); // Access data here
//     // Rest of your code that relies on the response data
//   })
//   .catch((error) => {
//     // Handle errors here
//   });

// console.log("Hello!");

// for (i = 0; i < endpoints.length; i++){
//     fs.appendFileSync('output.txt', endpoints[i]);
//     fs.appendFileSync('output.txt', "\n");
//     result = queryData.retrieveData( endpoints[i], [], {  });
//     const jsonString = JSON.stringify(result);
//     fs.appendFileSync('output.txt', jsonString.substring(0, 8000));
//     fs.appendFileSync('output.txt', "\n");
// }