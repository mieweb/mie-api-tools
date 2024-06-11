const { retrieveRecord } = require('./src/Retrieve Records/getData');
const { updateRecord } = require('./src/Update Records/requests_PUT');
const { retrieveDocs } = require('./src/Documents/documentDownload');
const { uploadDocs } = require('./src/Documents/documentUpload');
const { retrievePatientRecords, retrieveCustomRecords } = require('./src/Retrieve Records/patient_summary');
const { summarizePatient, askAboutPatient } = require('./src/Retrieve Records/AIGemini');
const { createLedger } = require('./src/Logging/createLedger');
const { createRecord } = require('./src/Create Records/requests_POST');
const { URL, practice, username, password, logging, GeminiKey } = require('./src/Variables/variables');

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
    URL: URL,
    practice: practice,
    username: username,
    password: password,
    ledger: logging,
    GeminiKey: GeminiKey
}