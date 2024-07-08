const { retrieveRecord } = require('./src/Retrieve Records/getData.cjs');
const { updateRecord } = require('./src/Update Records/requests_PUT.cjs');
const { retrieveDocs } = require('./src/Documents/documentDownload.cjs');
const { uploadDocs } = require('./src/Documents/documentUpload.cjs');
const { retrievePatientRecords, retrieveCustomRecords } = require('./src/Retrieve Records/patient_summary.cjs');
const { summarizePatient, askAboutPatient } = require('./src/Retrieve Records/AIGemini.cjs');
const { createLedger } = require('./src/Logging/createLedger.cjs');
const { createRecord } = require('./src/Create Records/requests_POST.cjs');
const { getCookie } = require('./src/Session Management/getCookie.cjs');
const { URL, practice, username, password, logging, GeminiKey, cookie } = require('./src/Variables/variables.cjs');

module.exports = {
    retrieveRecord: retrieveRecord,
    updateRecord: updateRecord,
    downloadDocs: retrieveDocs,
    uploadDocs: uploadDocs,
    getAllPatientRecords: retrievePatientRecords,
    summarizePatient: summarizePatient,
    queryPatient: askAboutPatient,
    createLedger: createLedger,
    createRecord: createRecord,
    getCustomRecords: retrieveCustomRecords,
    getCookie: getCookie,
    URL: URL,
    practice: practice,
    username: username,
    password: password,
    ledger: logging,
    GeminiKey: GeminiKey,
    Cookie: cookie
}