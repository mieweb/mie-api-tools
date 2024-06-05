
# MIE API Tools

A package designed to interact with the MIE's (Medical Informatics Engineering) [Webchart](https://www.webchartnow.com/) API seamlessly in NPM environments.

## Table of Contents

* [Installation](#Installation)
* [Methods and Features](#Methods-and-Features)
* [Retrieving Records](#Retrieving-Records)
    *  [Search by Querying](#Search-by-Querying)
    *  [Filtering by Fields](#Filtering-by-Fields)
    *  [Retrieving all Patient Data](#Retrieving-all-Patient-Data)
*  [Updating Records](#Updating-Records)
*  [Creating Records](#Creating-Records)
*  [Patient Documents](#Patient-Documents)
    * [Downloading Documents](#Downloading-Documents)
        * [Download Single Document](#Downloading-Single-Document)
        * [Download Multiple Documents](#Downloading-Multiple-Documents)
    * [Uploading Documents](#Uploading-Documents)
        * [Upload Single Document](#Upload-Single-Document)
        * [Upload Multiple Documents](#Upload-Multiple-Documents)

## Installation

**NPM**  
`$ npm i mie-api-tools`

**Yarn**  
`$ yarn add mie-api-tools`

**PNPM**  
`$ pnpm add mie-api-tools`

Once the package is installed, you can import it into your project using `require`  
`const { retrieveRecord } = require('mie-api-tools');`
> **NOTE:** Default export is highly reccomended. If you want to use a named export only, you must install the appropriate global variables that will be used to make your request
>
> **Example**: Importing the retrieveRecord method requires `const { retrieveRecord, URL, practice, username, password} = require('mie-api-tools');` Simply importing `const { retrieveRecord } = require('mie-api-tools');` will not work.

As of version 1.0.0, Mie API Tools **does not support ES Modules**. However, ES support is being implemented in a later version.

## Methods and Features

* Retrieve Records
    * Search through queries
    * Filter by fields
    * Get all data related to a patient.
* Update Records
    * Update any record with JSON data
* Create Recrods
    * Create any record with JSON data
* Patient Documents
    * Downloading Documents
        *  Download single documents
        *  Download multiple documents through querying
            * **Multi-Threading** allows for extremely fast downloading  
    * Uploading Documents
        * Upload single documents
        * Upload multiple documents with through a CSV file
            * **Multi-Threading** allows for extremely fast uploading
* AI Capabilities (using [Gemini](https://ai.google.dev/))
    * Summarize patients' entire medical history in any style
    * Ask questions about patients' medical history
* Ledger
    * Can be turned on or off.
    * Log all requests, responses, and errors.
    * Can customize your ledger and the location logs are written to.

## Retrieving Records

Perhaps the most common use case of the package is getting database records. This can be achieved with the `mie.retrieveRecord()` method.

The basic structure of the request is as follows:

```javascript
mie.retrieveRecord("patients", [ ], { })
.then((data) => {
    console.log(data);
})
.catch((err) => {
    console.error(err);
});
```

`mie.retrieveRecord()` accepts the following parameters:


| Name          | Required?               |  Description    |
| ------------- | --------------------------- | --------------- |
| `endpoint`       |              Required      | The specific API endpoint that you wish to query from. By default, WebChart has 191 endpoints which can be found in *Control Panel &rarr; API* of your WebChart. |
| `fields`      | `[]` no fields | Fields that you want to display (parse) in the response. Only these fields will be returned. |
| `queries`      |`{}` no queries | Fields that you want to query by to help locate specific records.|

**Response Format**: JSON
>**NOTE:** Only specifying the endpoint while leaving the other parameters empty will return **ALL** data for that endpoint. For example, when retrieving records for the `patients` endpoint, all `patients` data will be returned.

Although `mie.retrieveRecord()` returns a promise, the method can also be invoked with `await/async`.

```javascript
async function myFunc() {
    const data = await mie.retrieveRecord("documents", [ ], { });
    console.log(data);    
}

myFunc();
```

### Search by Querying

In order to narrow down the records returned, you can specify queries to retrieve records by in the third parameter.

For example, in the `patients` endpoint, if you want to only return records pertaining to a patient with `pat_id: 18`:

```javascript
mie.retrieveRecord("patients", [], {pat_id: 18})
```

You are also able to chain queries together by placing multiple inside an object. This will narrow down a search even more.

```javascript
mie.retrieveRecord("patients", [], {first_name: "Will", sex: 'M'})
```

>**NOTE:** You can only query by fields that are available for that endpoint specifically. For example, `last_name` exists in the `patients` endpoint, making it a legal field to query by. However, querying by `doc_id` in that same endpoint will throw an error.

### Filtering by Fields

Sometimes a single records can have dozens of fields. If you are only looking for a certain field or fields, you can specify which ones in the second parameter.

For example, in the `documents` endpoint, if you want to return only the `storage_type` of each document:

```javascript
mie.retrieveRecord("documents", ["storage_type"], { doc_type: 'WCPHOTO' })
```

In the same example, if we  only want to return the `storage_type` and `doc_id`:
```javascript
mie.retrieveRecord("documents", ["storage_type", "doc_id"], { doc_type: 'WCPHOTO' })
```

Thus, the output would look something similar to this for a single record:

```json
'0': { 
pat_id: '9', 
storage_type: '0', 
doc_id: '659' 
}
```

>**NOTE:** When filtering by fields, the `pat_id` (if applicable) is always included in the returned data.

### Retrieving all Patient Data

There may be cases where you want to gather all the available records for a patient. However, these records can be scattered across dozens of endpoints, making it hard to query, let alone concatenate, all of the data.

MIE API Tools provides a method called `mie.getAllPatientRecords()` for doing this.

The basic structure of the request is as follows:

```javascript
mie.getAllPatientRecords(5, {length: "concise"})
.then((data) => {
    console.log(data);
})
.catch((err) => {
    console.error(err);
});*
```

`mie.getAllPatientRecords()` accepts the following parameters:

| Name          | Required?               |  Description    |
| ------------- | --------------------------- | --------------- |
| `pat_id`       |              Required      | The patient ID of the patient for whom you want to retrieve their information. |
| `options (length)`      | Optional| The length, or level of detail, of data that is returned. Length accepts `brief`, `concise`, and `detailed`. Each one returns more Records. Why the difference? Some endpoints provide very important (and relevant) patient information, while others provide less important and relevant information. The more brief the synopsis, the less lesser-relevant records that are returned. |

**Response Format**: JSON

## Updating Records

Another common use of the package is updating records at various API endpoints. This can be achieved by using the `mie.updateRecord()` method.

The basic structure of the request is as follows:

```javascript
const json_data = {
    "first_name": "William",
    "address1": "1690 Broadway Bldg 19, Ste 500, Fort Wayne, IN 46802"
};

mie.updateRecord("patients", { pat_id: 18}, json_data);
```

Updating records requires a JSON object that contains key-value pairs of fields to update.

`mie.updateRecord()` accepts the following parameters:

| Name          | Required?               |  Description    |
| ------------- | --------------------------- | --------------- |
| `endpoint`       |              Required      | The specific API endpoint that you wish to query from. By default, WebChart has 191 endpoints which can be found in *Control Panel &rarr; API* of your WebChart. |
| `identifier`      | Required| The unique ID of the specific record to update. |
| `json_options (new data)`      |`{}` No data to update | The new updated Data formatted as a JSON object.|

**Response Format**: none

>**NOTE:** Each endpoint has a specific identifier. For those that deal with patient data, it is most likely `pat_id`. Other endpoints, such as `documents` have `doc_id` as their identifier. A complete list can be found inside the API Docs of your WebChart or in [*src/Variables/endpointLists.js*](https://github.com/maxklema/mie-api-tools/blob/main/src/Variables/endpointLists.js) of this repository.

>**NOTE:** By Default, not all endpoints support UPDATE functionality. Double check that the API endpoint you want to use supports UPDATE functionality.


## Creating Records

Creating new Records is another important capability of MIE API Tools. The methodology is very similar to `mie.updateRecords()` but without the identifier. This can be achieved by using the `mie.createRecord()` method.

The basic structure of the request is as follows:

```javascript
const json_data = {
    "first_name": "William",
    "address1": "1690 Broadway Bldg 19, Ste 500, Fort Wayne, IN 46802"
};

mie.createRecord("patients", json_data);
```

Updating records requires a JSON object that contains key-value pairs of fields to update.

`mie.updateRecords()` accepts the following parameters.

| Name          | Required?               |  Description    |
| ------------- | --------------------------- | --------------- |
| `endpoint`       |              Required      | The specific API endpoint that you wish to query from. By default, WebChart has 191 endpoints which can be found in *Control Panel &rarr; API* of your WebChart. |
| `new_data`      |`{}` No data to update | The new Data to post to an endpoint formatted as a JSON object.|

**Response Format**: none

>**NOTE:** When creating a new record in a certain endpoint, it is **not necessary** to include all possible field-value pairs in the JSON object. For example, when creating a new patient, you do not have to fill in every field, such as `first_name`, `ssn`, `address3`, etc. A new patient will still be created with the fields you did include in the JSON object while the remaining fields will be left blank.

>**NOTE:** By Default, not all endpoints support POST functionality. Double check that the API endpoint you want to use supports POST functionality.

## Patient Documents

An integral part of WebChart is being able to store patient documents. WebChart supports 28 different storage types and dozens of document types. For a complete chart explaining the storage types, see [Custom Documents CSV API](https://docs.enterprisehealth.com/functions/system-administration/data-migration/custom-documents-csv-api/#process).

MIE API Tools allows you to download a collection of documents and upload a collection of documents.

### Downloading Documents

MIE API Tools allows you to download a single document at a time as well as multiple documents at once through querying. Download functionalities also allow for an optimization option, which allows for faster downloading.

#### Download Single Document

There may be times when you only want to download a single document from a single patient. This can be achieved by using the `mie.downloadDoc()` function.

The Basic Structure of the Request is as follows:

```javascript
mie.downloadDoc(29, "./downloads/photos", 1);
```

`mie.downloadDoc()` accepts the following parameters.

| Name          | Required?               |  Description    |
| ------------- | --------------------------- | --------------- |
| `documentID`      |  Required      | The ID of the document you want to download. |
| `directory`      | Required | The directory you want to place your downloaded file in.|
| `optimization`      | Optional | When left blank, optimization is turned off. When set to `1`, optimization is turned on. When optimization is on, filenames follow the format: `doc_id.extension`. When optimization is off, filenames follow the format: `(pat_last_name)_(doc_id).extension`. The difference is significant in that the patient's last name does not need to be queried before the document is downloaded, saving time.|

**Response Format**: String with a success / failure status  in the format: `File "downloads/Doe_827.jpg" was downloaded`.

#### Download Multiple Documents

Often times, you will want to download multiple documents at once. This can be achieved by using the `mie.downloadDocs()` function.

The Basic structure of the Request is as follows:

```javascript
mie.downloadDocs({storage_type: 8}, "downloads", 0);
```

`mie.downloadDocs()` accepts the following parameters:


| Name          | Required?               |  Description    |
| ------------- | --------------------------- | --------------- |
| `queryString`      |  Required      | Fields that you want to query by to help locate specific documents for download. All documents that are returned by the query will be downloaded. |
| `directory`      | Required | The directory you want to place your downloaded file in.|
| `optimization`      | Optional | When left blank, optimization is turned off. When set to `1`, optimization is turned on. When optimization is on, filenames follow the format: `doc_id.extension`. When optimization is off, filenames follow the format: `(pat_last_name)_(doc_id).extension`. The difference is significant in that the patient's last name does not need to be queried before the document is downloaded, saving time.|

**Response Format**: String with a success / failure status  in the format: `File "downloads/Doe_827.jpg" was downloaded`.

Similar to [Retrieving Records by Querying](#Search-by-Querying), `mie.downloadDocs()` also takes an object with queries. You can only filter by the fields that belong to the `documents` endpoint. You can find a full list at *Control Panel &rarr; API &rarr; Documents*.

You are also able to chain queries together to download more specific documents. For example:\
`mie.downloadDocs({ storage_type: 8, doc_type: 'WCPHOTO' }, "downloads", 0);`

>**NOTE:** `mie.downloadDocs()` uses [multi-threading](https://www.geeksforgeeks.org/mutlithreading-in-javascript/) to download documents much faster. By default, the number of worker threads is set to the number of cores of your CPU (normally 8). If you want to disable this or change the value, you have to set it manually in [documentDownload.js](https://github.com/maxklema/mie-api-tools/blob/main/src/Documents/documentDownload.js) via the `MAX_WORKERS` constant.

### Uploading Documents

MIE API Tools allows you to upload a single document at a time as well as multiple documents at once by crafting a custom CSV file (see more below). With the uploading capabilities, you are able to specify fields such as `subject`, `service_location`, and `service_date` with each upload.

#### Upload Single Document

There may be times when you only want to upload a single document for a single patient. This can be achieved by using the `mie.uploadDoc()` function.

The basic structure of the request is as follows:

```javaascript
mie.uploadDoc("patient_photo/29.jpg", 8, "WCPHOTO", 14, {subject: "This is a new photo upload", service_location: "OFFICE", service_date: "2008-08-10 00:00:00"});
```

`mie.uploadDoc()` accepts the following parameters:

| Name          | Required?               |  Description    |
| ------------- | --------------------------- | --------------- |
| `filename`      |  Required      | The file path of the file that you want to upload to a patient's portal. |
| `storageType`      | Required | The storage type of the file that you are uploading. For a full list, see [Custom Documents](https://docs.enterprisehealth.com/functions/system-administration/data-migration/custom-documents-csv-api/#process).|
| `docType`      | Required | The type of document that is being uploaded. For example, `WCPHOTO` for a patient photo.|
| `patID`      | Required | The patient ID of the patient for whom you want to upload a document. |
| `options`      | Optional | There are  three additional options that can be added when uploading a document: `subject`, `service_location`, and `service_date`. The `subject` is a description of the upload, `service_location` is the location from which the document originated, and `service_date` is the date when "a medical service or procedure was provided to a patient, or when a particular service or claim was processed." **NOTE:** you can include any of three fields, all of them, or none of them.|

**Response Format:** String with a success / failure status in the format: `File "downloads/29.jpg" was uploaded: Document (0000965) Uploaded Successfully!`.

>**NOTE:** While MIE API Tools supports *most* storage types, some are not supported (yet). However, there are work-arounds. For example, `storage_type: 13 (.HTM)` files do not upload correctly to WebChart. However, using `storage_type: 4 (.HTML)` instead will successfully upload the document. The same is true with `storage_type: 7 (.tif)` files.  Instead, change the file to `storage_type: 3 (.png)` or `storage_type: 17 (.pdf)` which will work. If therw are any other storage types that raise similar issues, please feel free to create an issue or discussion thread (or even a pull request).

#### Upload Multiple Documents


## Motivation

MIE has an API that integrates with WebChart (Electronic Health Record) Systems, allowing developers and healthcare professionals access to critical medical data from the WebChart server. However, to use the MIE API, it has to be run in a browser using HTTPS requests. This makes it hard for developers to use the API and can lead to problems including scalability issues, session management, and security concerns. Since browsers are not optimized for handling large numbers of connections and requests, with the API running in a browser, it may be harder to handle large volumes of requests. Browser sessions are not long, resulting in the API facing challenges in managing longer-term sessions. This can then affect the ability to maintain persistent connections across multiple API requests. Overall, integrating the MIE API with Webchart EHR systems through a browser is not the optimal method to utilize this important API.

This package allows for the API to be used seamlessly by being capable of performing both basic and advanced CRU operations, uploading and downloading documents, summarizing patient medical records and asking questions about patients, and logging all requests, responses, and errors as needed.

## Author

- [@maxklema](https://www.github.com/maxklema)

