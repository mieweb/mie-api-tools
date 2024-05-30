const error = require('../errors');
const log = require('../Logging/createLog');
const queryData = require('../Retrieve Records/getData');
const { endpointsOne, endpointsTwo, endpointsThree } = require('../Variables/endpointLists');


async function retrievePatientRecords(patID, options = {length: "detailed"}){

    let records;

    switch(options["length"]){

        case "detailed":
            records = await retrieveAllPatientRecords(patID);
            break;
        case "concise":
            records = await retrievePatientSummaryRaw(patID);
            break;
        case "brief":
            records = await retrievePatientSummaryHigh(patID);
            break;
        default:
            log.createLog("error", "Bad Parameter");
            throw new error.customError(error.ERRORS.BAD_PARAMETER, `The \"Length\" value \"${options["length"]}\" was invalid`);
    };

    return JSON.stringify(records);

}

async function retrieveAllPatientRecords(patID){
    
    log.createLog("info", `Patient Retrieval Request (All Records):\nPatient ID: ${patID}`);
    await verifyPatientID(patID);
    
    if (Number.isInteger(patID)){
        
        let patient_summary_data = await parseAllRecords(patID, endpointsOne);
        log.createLog("info", `Patient Retrieval Response (All Records):\nSuccessfully collected at records associated with Patient ID: ${patID}`);

        return patient_summary_data;

    } else {
        log.createLog("info", `Patient Retrieval Response (All Records):\nFailed to collect all records associated with Patient ID: ${patID}`);
        log.createLog("error", "Bad Parameter");
        throw new error.customError(error.ERRORS.BAD_PARAMETER, `\"patID\" parameter must be an integer. Instead, \"${patID}\" was passed in.`);
    }    
}

async function retrievePatientSummaryRaw(patID){

    log.createLog("info", `Patient Retrieval Request (Top Records):\nPatient ID: ${patID}`);
    await verifyPatientID(patID);

    if (Number.isInteger(patID)){
        
        let patient_summary_data = await parseAllRecords(patID, endpointsTwo);
        log.createLog("info", `Patient Retrieval Response (Top Records):\nSuccessfully collected at records associated with Patient ID: ${patID}`);
        
        return patient_summary_data;

    } else {
        log.createLog("info", `Patient Retrieval Response (Top Records):\nFailed to collect all records associated with Patient ID: ${patID}`);
        log.createLog("error", "Bad Parameter");
        throw new error.customError(error.ERRORS.BAD_PARAMETER, `\"patID\" parameter must be an integer. Instead, \"${patID}\" was passed in.`);
    }
}

async function retrievePatientSummaryHigh(patID){

    log.createLog("info", `Patient Retrieval Request (Top Records Filtered):\nPatient ID: ${patID}`);
    await verifyPatientID(patID);

    if(!(Number.isInteger(patID))){
        log.createLog("info", `Patient Retrieval Response (Top Records Filtered):\nFailed to collect all records associated with Patient ID: ${patID}`);
        log.createLog("error", "Bad Parameter");
        throw new error.customError(error.ERRORS.BAD_PARAMETER, `\"patID\" parameter must be an integer. Instead, \"${patID}\" was passed in.`);
    }

    patient_summary_data = {}

    //loop through all endpoints in the list and return only important information
    for (i = 0; i < endpointsThree.length; i++){

        let patient_info;
        let db_response;

        try {
            switch(endpointsThree[i]) {
                case "patient_conditions":
                    patient_info = await queryData.retrieveRecord(endpointsThree[i], ["description"], {pat_id: patID});
                    db_response = patient_info;
                    break;
                case "incidents":
                    patient_info = await queryData.retrieveRecord(endpointsThree[i], ["comments", "hospitalized", "comment_activity", "case_type", "inc_datetime", "comment_cause", "comment_explanation"], {pat_id: patID});
                    db_response = patient_info;
                    break;
                case "patient_conditions_family":
                    patient_info = await queryData.retrieveRecord(endpointsThree[i], ["description"], {pat_id: patID});
                    db_response = patient_info;
                    break;
                case "patient_procedures":
                    patient_info = await queryData.retrieveRecord(endpointsThree[i], ["description", "entered_date"], {pat_id: patID});
                    db_response = patient_info;
                    break;
                case "patient_targets":
                    patient_info = await queryData.retrieveRecord(endpointsThree[i], ["target", "modified_date"], {pat_id: patID});
                    db_response = patient_info;
                    break;
                case "encounter_orders":
                    patient_info = await queryData.retrieveRecord(endpointsThree[i], ["order_name", "modified_dt"], {pat_id: patID});
                    db_response = patient_info;
                    break; 
                case "encounters":
                    patient_info = await queryData.retrieveRecord(endpointsThree[i], ["chief_complaint", "create_date", "location", "stage", "visit_type", "diagnosis2"], {pat_id: patID});
                    db_response = patient_info;
                    break;
                case "encounters_current":
                    patient_info = await queryData.retrieveRecord(endpointsThree[i], ["edit_datetime"], {pat_id: patID});
                    db_response = patient_info;
                    break;
                case "rxlist":
                    patient_info = await queryData.retrieveRecord(endpointsThree[i], ["drug_name", "indication", "entered_date", "end_date"], {pat_id: patID});
                    db_response = patient_info;
                    break;
                case "rxlist_allergylist":
                    patient_info = await queryData.retrieveRecord(endpointsThree[i], ["allergy_name", "comments", "revision_date"], {pat_id: patID});
                    db_response = patient_info;
                    break;
                case "insurance_policy":
                    patient_info = await queryData.retrieveRecord(endpointsThree[i], ["plan_name", "start_datetime", "relation_insured"], {pat_id: patID});
                    db_response = patient_info;
                    break;           
                default:
                    patient_info = await queryData.retrieveRecord(endpointsThree[i], [], {pat_id: patID});
                    db_response = patient_info['db'];
                    break;
            }
        } catch (err) {
            log.createLog("info", `Patient Retrieval Response (All Records):\nFailed to collect all records associated with Patient ID: ${patID}`);
            log.createLog("error", "Bad Request");
            throw new error.customError(error.ERRORS.BAD_REQUEST, `Your request to receive records at endpoint \"${endpointsThree[i]}\" with Patient ID ${patID}.`);
        }
        
        patient_summary_data[endpointsThree[i]] = db_response;
    
    }

    log.createLog("info", `Patient Retrieval Response (Top Records):\nSuccessfully collected at records associated with Patient ID: ${patID}`);
    return patient_summary_data;

}

async function parseAllRecords(patID, list){

    patient_summary_data = {};

    for (i = 0; i < list.length; i++){
        
        let patient_info;
        let db_response;

        patient_info = await queryData.retrieveRecord(list[i], [], {pat_id: patID});
        
        try {
            db_response = patient_info['db'];
        } catch (err) {
            log.createLog("info", `Patient Retrieval Response:\nFailed to collect all records associated with Patient ID: ${patID}`);
            log.createLog("error", "Bad Request");
            throw new error.customError(error.ERRORS.BAD_REQUEST, `Your request to receive records at endpoint \"${list[i]}\" with Patient ID ${patID}.`);
        }
        
        patient_summary_data[list[i]] = db_response;
    }
    return patient_summary_data;

}

async function verifyPatientID(patID){

    let response = await queryData.retrieveRecord("patients", [], { pat_id: patID});
   
    if (response['meta']['status'] == 204){
        log.createLog("info", `Patient Retrieval Response:\nFailed to collect patient information with Patient ID ${patID} because no patient with that ID exists.`);
        log.createLog("error", "Bad Parameter");
        throw new error.customError(error.ERRORS.BAD_PARAMETER, `No patient exists with ID \"${patID}\".`);    
    }

}

async function retrieveCustomRecords(endpoint_list, filters=[], queryby = {}, OmitErrors = 1){

    patient_summary_data = {};
    let filters2D = false;
    let options2D = false;

    //check if parameters are 2D or 1D arrays
    if (filters.length != 0){
        filters2D = Array.isArray(filters[0]) ? true : false
    }

    options2D = Array.isArray(queryby) ? true : false

    //iterate over the endpoint list
    for (i = 0; i < endpoint_list.length; i++){

        //check if error catching is on
        if (OmitErrors == 1){
            try {
                patient_summary_data[endpoint_list[i]] = await makeCustomRecordsRequest(i, endpoint_list, filters2D, options2D, filters, queryby);
            } catch {
                continue; //move to the next endpoint
            }
        } else if (OmitErrors == 0) {
            patient_summary_data[endpoint_list[i]] = await makeCustomRecordsRequest(i, endpoint_list, filters2D, options2D, filters, queryby, OmitErrors);
        } else {
            log.createLog("error", "Bad Parameter");
            throw new error.customError(error.ERRORS.BAD_PARAMETER, `The \"OmitErrors\" variable must be 0 or 1. You set it to \"${OmitErrors}\"`);    
        }
    }
    return patient_summary_data;

}

async function makeCustomRecordsRequest(i, endpoint_list, filters2D, options2D, filters, queryby, OmitErrors){

    let filtersPm = filters2D ? filters[i] : filters
    let optionsPm = options2D ? queryby[i] : queryby

    if (OmitErrors == 0){
        if (filters2D && !filters[i]){
            log.createLog("error", "Bad Parameter");
            throw new error.customError(error.ERRORS.BAD_PARAMETER, `No filters exist when querying for endpoint \"${endpoint_list[i]}\". If your filters are unique for each endpoint, make sure the number of endpoints (currently \"${endpoint_list.length}\") is equal to the number of filter arrays.`);    
        } else if (options2D && !queryby[i]) {
            log.createLog("error", "Bad Parameter");
            throw new error.customError(error.ERRORS.BAD_PARAMETER, `No query options exists when querying for endpoint \"${endpoint_list[i]}\". If your options are unique for each endpoint, make sure the number of endpoints (currently \"${endpoint_list.length}\") is equal to the number of option objects.`);    
        }
    }

    let patient_info = await queryData.retrieveRecord(endpoint_list[i], filtersPm, optionsPm);
    let db_response = filtersPm.length == 0 ? patient_info['db'] : patient_info;
    
    return db_response;

}

module.exports = { 
    retrievePatientRecords,
    retrieveCustomRecords
 }