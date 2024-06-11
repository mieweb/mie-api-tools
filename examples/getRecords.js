const mie = require('../index');

mie.URL.value = "";
mie.practice.value = "";
mie.username.value = ""
mie.password.value = "";


//queries the database for patient 14
mie.retrieveRecord("patients", [], { pat_id: 14 })
.then((result) => {
    console.log(result);
})
.catch((err) => {
    console.error(err);
})


//queries the database for document 29
//Only displays "storage_type" and "doc_type"
mie.retrieveRecord("documents", ["doc_type"], { doc_id: 29 })
.then((result) => {
    console.log(result);
})
.catch((err) => {
    console.error(err);
})


async function myFunc() {

    //you can call retrieveRecord() in an async function, too!
    const encounter = await mie.retrieveRecord("encounters", [], {});
    console.log(JSON.stringify(encounter));

}

myFunc();

