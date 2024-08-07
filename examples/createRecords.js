const mie = require('../index');

mie.URL.value = "";
mie.practice.value = "";
mie.username.value = ""
mie.password.value = "";


//Creating a new Patient
const new_patient_data = {
    "first_name": "Jared",
    "last_name": "Kinsley",
    "ssn": "342301932",
    "address1": "1690 Broadway Bldg 19, Ste 500, Fort Wayne, IN 46802"
}
mie.post("patients", new_patient_data);