const mie = require('../../index');

mie.URL.value = "";
mie.practice.value = "";
mie.username.value = ""
mie.password.value = "";

//download all documents from patient 4 (Optimization Off)
mie.downloadDocs({ pat_id: 6 }, "Downloaded Files", 0);

//download document 1384 (Optimization On)
mie.downloadDocs({ doc_id: 1384 }, "Downloaded Files", 1);
