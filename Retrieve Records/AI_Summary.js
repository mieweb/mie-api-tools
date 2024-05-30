const error = require('../errors');
const log = require('../Logging/createLog');
const getPatientData = require('./patient_summary');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require('fs');

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

async function summarizePatient(patID, key, options = {"adjective": "concise", "model": "gemini-1.5-flash"}){

    let Gmodel = "model" in options ? options["model"] : "gemini-1.5-flash"
    let adjective = "adjective" in options ? options["adjective"] : "concise"
    const raw_patient_data = await getPatientData.retrievePatientSummaryHigh(patID);

    const summary = await makeGeminiRequest(raw_patient_data, key, adjective, Gmodel);

    return summary;

}

async function makeGeminiRequest(raw_patient_data, key, adjective, Gmodel){

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: Gmodel});

    const prompt = `Provide a ${adjective.toUpperCase()} word summary in PARAGRAPH FORM about this patient's medical history. It is formatted in JSON: ${JSON.stringify(raw_patient_data)}`;

    const parts = [
        {text: prompt}
    ]

    const result = await model.generateContent({
        contents: [{
            role: "user",
            parts
        }],
        generationConfig,
        safetySettings
    }, (err) => {
        if (err){
            console.error(err);
        }
    });

    const text_response = result.response;
    return text_response.text();

}

module.exports = { summarizePatient };