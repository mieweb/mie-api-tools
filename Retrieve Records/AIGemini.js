const error = require('../errors');
const log = require('../Logging/createLog');
const getPatientData = require('./patient_summary');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const { GeminiKey } = require('../Variables/variables');

const safetySettings = [
    {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
    }
];

const generationConfig = {
    temperature: 0.8,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};

async function summarizePatient(patID, options = {adjective: "concise", model: "gemini-1.5-flash"}){

    let Gmodel = "model" in options ? options["model"] : "gemini-1.5-flash"
    let adjective = "adjective" in options ? options["adjective"] : "concise"
    
    log.createLog("info", `Patient Summary AI Request:\nPatient ID: ${patID}\nGemini Model: \"${Gmodel}\"\nAdjective: \"${adjective}\"`);

    const raw_patient_data = await getPatientData.retrievePatientRecords(patID, {length: "brief"});
    
    query_options = {
        key: GeminiKey.value,
        Gmodel: Gmodel,
        adjective: adjective,
        raw_patient_data: raw_patient_data,
        patID: patID
    }

    const summary = await formGeminiRequest("summary", query_options);
    log.createLog("info", `Patient Summary AI Response:\nSuccessfully retrieved response for Patient ID: ${patID}\nGemini Model: \"${Gmodel}\"\nAdjective: \"${adjective}\"\nSummary: \"${summary}\"`);

    return summary;

}

async function askAboutPatient(patID, query, options = { model: "gemini-1.5-flash"}){

    let Gmodel = "model" in options ? options["model"] : "gemini-1.5-flash"
    
    log.createLog("info", `Patient Query AI Request:\nPatient ID: ${patID}\nGemini Model: \"${Gmodel}\"\nQuery: \"${query}\"`);
    const raw_patient_data = await getPatientData.retrievePatientRecords(patID, {length: "brief"});

    query_options = {
        query: query,
        key: GeminiKey.value,
        Gmodel: Gmodel,
        raw_patient_data: raw_patient_data,
        patID: patID
    }

    const answer = await formGeminiRequest("query", query_options);
    log.createLog("info", `Patient Query AI Response:\nSuccessfully retrieved response for Patient ID: ${patID}\nGemini Model: \"${Gmodel}\"\nResponse: \"${answer}\"`);

    return answer;

}

async function formGeminiRequest(type, options){
    switch (type){
        case "summary":
            prompt = `Provide a ${options["adjective"].toUpperCase()} word summary in PARAGRAPH FORM about this patient's medical history. It is formatted in JSON: ${JSON.stringify(options["raw_patient_data"])}`;
            return await makeGeminiRequest(prompt, options);
        case "query":
            prompt = `${options["query"]}: Answer in PARAGRAPH FORM. The data is formatted in JSON: ${JSON.stringify(options["raw_patient_data"])}`;
            return await makeGeminiRequest(prompt, options);
    }
}

async function makeGeminiRequest(prompt, options){

    const genAI = new GoogleGenerativeAI(options["key"]);
    const model = genAI.getGenerativeModel({ model: options["Gmodel"]});

    const parts = [
        {text: prompt}
    ]

    let result;

    try {
        result = await model.generateContent({
            contents: [{
                role: "user",
                parts
            }],
            generationConfig,
            safetySettings
        });
    } catch (err) {
        log.createLog("info", `Patient (Summary/Query) AI Response:\nFailed to send a valid request to Gemini with Patient ID: ${options["patID"]}, Model: \"${options["Gmodel"]}\"`);
        log.createLog("error", "Bad Request");
        throw new error.customError(error.ERRORS.BAD_REQUEST, `The Request you made to Gemini was invalid: ${err}`);
    }

    const text_response = result.response;
    return text_response.text();

}

module.exports = { summarizePatient, askAboutPatient };