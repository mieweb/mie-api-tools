const mie = require('../../index');

mie.URL.value = "";
mie.practice.value = "";
mie.username.value = ""
mie.password.value = "";

//Upload all the documents in the CSV (see CSV file for details)
mie.uploadDocs("docsToUpload.csv");