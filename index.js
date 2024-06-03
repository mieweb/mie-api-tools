const { retrieveRecord } = require('./Retrieve Records/getData');
const { updateRecord } = require('./Update Records/requests_PUT');
const { retrieveSingleDoc, retrieveDocs } = require('./Documents/documentDownload');
const { uploadSingleDocument, uploadDocs } = require('./Documents/documentUpload');
const { retrievePatientRecords, retrieveCustomRecords } = require('./Retrieve Records/patient_summary');
const { summarizePatient, askAboutPatient } = require('./Retrieve Records/AIGemini');
const { createLedger } = require('./Logging/createLedger');
const { createRecord } = require('./Create Records/requests_POST');
const { URL, practice, username, password, logging, GeminiKey } = require('./Variables/variables');

module.exports = {
    retrieveRecord: retrieveRecord,
    updateRecord: updateRecord,
    downloadDoc: retrieveSingleDoc,
    downloadDocs: retrieveDocs,
    uploadDoc: uploadSingleDocument,
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