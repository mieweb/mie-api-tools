const mie = require('../index');
const fs = require('fs');

mie.URL.value = "";
mie.practice.value = "";
mie.username.value = ""
mie.password.value = "";

//Getting all Patient 5's medical records concisely.
mie.getAllPatientRecords(5, {length: "concise"})
.then((data) => {
    
    //writing the data to a file
    fs.writeFile("patient5Data.txt", data, () => {
        console.log("finish");
    });


});