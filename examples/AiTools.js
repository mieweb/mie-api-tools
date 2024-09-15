const mie = require('../index');

mie.URL.value = "";
mie.practice.value = "";
mie.username.value = ""
mie.password.value = "";
mie.GeminiKey.value = "";

/*
NOTE: AI responses may not always be accurate. Use with caution.
*/

//Summarize Patient 18's medical history (default options)
mie.summarizePatient(18)
.then((result) => {
    console.log(result);
})

//Summarize Patient 18's medical history (options)
mie.summarizePatient(18, {adjective: "short", model: "gemini-1.5-flash"})
.then((result) => {
    console.log(result);
})

//Asking a question about patient 18's insurance
mie.queryPatient(18, "Does this patient have insurance?")
.then((response) => {
    console.log(response);
})

