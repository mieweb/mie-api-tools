const mie = require('../index');

mie.URL.value = "";
mie.practice.value = "";
mie.username.value = ""
mie.password.value = "";


//Update Patient 40's first name, SSN, and address
const data_to_update = {
    "first_name": "Brooklyn",
    "ssn": "342098712",
    "address1": "1690 Broadway Bldg 19, Ste 500, Fort Wayne, IN 46802"
}
mie.updateRecord("patients", { pat_id: 40 }, data_to_update);


//Update Document 2500's storage type to '13'
const document_data = {
    "storage_type": "13"
}
mie.updateRecord("documents", { doc_id: 2500 }, document_data);
