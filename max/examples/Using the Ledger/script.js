const mie = require('../../index');

mie.URL.value = "";
mie.practice.value = "";
mie.username.value = ""
mie.password.value = "";
mie.ledger.value = "true";

/* Specify Ledger Options
Info logs are written to "Logs/info.log"
Error logs are written to "Logs/errors.log" */
const logging_options = {
    "levels": ["info", "error"],
    "format": ["levels", "timestamps"],
    "storage": ["Logs/info.log", "Logs/errors.log"],
    "log_returned_data": "false"
}

//Creating the Ledger
mie.createLedger(logging_options);

//Example Request One (produces error -> 403 BAD REQUEST -> No API Key Provided)
mie.summarizePatient(18)
.then((result) => {
    console.log(result);
})

//Example Request Two
const data_to_update = {
    "first_name": "Brooklyn",
    "ssn": "342098712",
    "address1": "1690 Broadway Bldg 19, Ste 500, Fort Wayne, IN 46802"
}
mie.updateRecord("patients", { pat_id: 40 }, data_to_update);

//Example Request Three
mie.downloadDocs({ pat_id: 6 }, "Downloaded Files", 0);



