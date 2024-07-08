import getRecord from './src/Retrieve Records/getData.cjs';
import updateExistingRecord from './src/Update Records/requests_PUT.cjs';
import retrieveDetailedRecords from './src/Retrieve Records/patient_summary.cjs';
import AI from './src/Retrieve Records/AIGemini.cjs';
import Vars from './src/Variables/variables.cjs';
import Post from './src/Create Records/requests_POST.cjs';
import retrieveCookie from './src/Session Management/getCookie.cjs';

const { retrieveRecord } = getRecord;
const { updateRecord } = updateExistingRecord;
const { retrievePatientRecords, retrieveCustomRecords } = retrieveDetailedRecords
const { summarizePatient, askAboutPatient } = AI
const { createRecord } = Post
const { URL, practice, username, password, GeminiKey, cookie } = Vars;
const { getCookie } = retrieveCookie;

export default {
    retrieveRecord: retrieveRecord,
    updateRecord: updateRecord,
    getAllPatientRecords: retrievePatientRecords,
    summarizePatient: summarizePatient,
    queryPatient: askAboutPatient,
    createRecord: createRecord,
    getCustomRecords: retrieveCustomRecords,
    getCookie: getCookie,
    URL: URL,
    practice: practice,
    username: username,
    password: password,
    GeminiKey: GeminiKey,
    Cookie: cookie
}