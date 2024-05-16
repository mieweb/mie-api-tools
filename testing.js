require('dotenv').config();

const { URL, username, password } = require('./variables.js');
const mieapi = require('./getRequests');

URL.value = "https://maxprac.webchartnow.com/webchart.cgi";
username.value = process.env.USERNAME;
password.value = process.env.PASSWORD;

console.log(mieapi.makeGETRequest("patients", { pat_id: 110 }));
