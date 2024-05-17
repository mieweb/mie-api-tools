require('dotenv').config();

const { URL, username, password } = require('./variables.js');
const queryData = require('./Get Requests/getData.js');

URL.value = "https://maxprac.webchartnow.com/webchart.cgi";
username.value = process.env.USERNAME;
password.value = process.env.PASSWORD;

//console.log(queryData.retrieveData( "patients", ["first_name", "last_name", "ssn", "home_phone", "sex", "birth_date"], { first_name: "E"}));
console.log(queryData.retrieveData( "order_types", [], { description: 'PT/OT' }));