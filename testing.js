require('dotenv').config();
const fs = require('fs');
const documentImport = require('./Documents/documentUpload')
const documentExport = require('./Documents/documentDownload');

const { URL, practice, username, password } = require('./variables.js');
const queryData = require('./Get Requests/getData.js');
const updateData = require('./Put Requests/requests_PUT');


URL.value = "https://mieinternprac.webchartnow.com/webchart.cgi";
practice.value = "mieinternprac";
username.value = process.env.USERNAME;
password.value = process.env.PASSWORD;



const json_data = {
    "first_name": "Williamz"
}

//updateData.makePUTRequest("patients", { pat_id: 18}, json_data);
//updateData.test();

// const jsonString = JSON.stringify(results);
// fs.appendFileSync('output.txt', jsonString);

//documentExport.retrieveSingleDoc(719, "output_files");
//documentImport.retrieveDocs({ pat_id: 14 }, "output/new_files");

//documentImport.uploadSingleDocument("Hart_667.pdf", 17, "PATH", 18);
//documentImport.uploadDocs("filesToUpload.csv");

async function runnerFunction() {
    //console.log(await queryData.retrieveData("documents", ["doc_id"], { doc_id: 14}));
    // console.log(await queryData.retrieveData("patients", [], { pat_id: 14 }));
    await documentExport.retrieveDocs({ pat_id: 6 }, "output");
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