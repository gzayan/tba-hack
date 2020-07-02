/* ----------------------------------------------------------------------------------------------------------------------
* © Copyright 2018 Visa. All Rights Reserved.
*
* NOTICE: The software and accompanying information and documentation (together, the “Software”) remain the property of
* and are proprietary to Visa and its suppliers and affiliates. The Software remains protected by intellectual property
* rights and may be covered by U.S. and foreign patents or patent applications. The Software is licensed and not sold.
*
* By accessing the Software you are agreeing to Visa's terms of use (developer.visa.com/terms) and privacy policy
* (developer.visa.com/privacy). In addition, all permissible uses of the Software must be in support of Visa products,
* programs and services provided through the Visa Developer Program (VDP) platform only (developer.visa.com).
* THE SOFTWARE AND ANY ASSOCIATED INFORMATION OR DOCUMENTATION IS PROVIDED ON AN “AS IS,” “AS AVAILABLE,” “WITH ALL
* FAULTS” BASIS WITHOUT WARRANTY OR CONDITION OF ANY KIND. YOUR USE IS AT YOUR OWN RISK.
---------------------------------------------------------------------------------------------------------------------- */

'use strict';
var api = require('../src/funds_transfer_api').funds_transfer_api;
var authCredentials = require('../credentials.json');

var funds_transfer_api = new api(authCredentials);

// path invoked is '/visadirect/fundstransfer/v1/reversefundstransactions';
funds_transfer_api.reversefunds(getParameters())
    .then(function(result) {
        // Put your custom logic here
        console.log('\n Response: ' + JSON.stringify(result.response));
        console.log('\n Response Status: ' + JSON.stringify(result.response.statusCode));
        console.log('\n--------------- Above product is Visa Direct ---------------');
        console.log('\n--------------- API is Funds Transfer Api ---------------');
        console.log('\n--------------- EndPoint is reversefunds ---------------');
        console.log('\n\n');
    })
    .catch(function(error) {
        console.log('\n Response: ' + JSON.stringify(error.response));
        console.log('\n Response Status: ' + JSON.stringify(error.response.statusCode));
        console.log('\n--------------- Above product is Visa Direct ---------------');
        console.log('\n--------------- API is Funds Transfer Api ---------------');
        console.log('\n--------------- EndPoint is reversefunds ---------------');
        console.log('\n\n');
    });

function getParameters() {
    var parameters = {
        "x-client-transaction-id": "{enter appropriate value}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    };
    parameters.payload = {
        "businessApplicationId": "AA",
        "senderCardExpiryDate": "2015-10",
        "transactionIdentifier": "381228649430011",
        "acquirerCountryCode": "608",
        "retrievalReferenceNumber": "330000550000",
        "cardAcceptor": {
            "idCode": "VMT200911026070",
            "address": {
                "county": "San Mateo",
                "country": "USA",
                "state": "CA",
                "zipCode": "94404"
            },
            "terminalId": "365539",
            "name": "Visa Inc. USA-Foster City"
        },
        "originalDataElements": {
            "acquiringBin": "408999",
            "systemsTraceAuditNumber": "897825",
            "approvalCode": "20304B",
            "transmissionDateTime": "2016-11-17T19:04:06"
        },
        "acquiringBin": "408999",
        "systemsTraceAuditNumber": "451050",
        "senderCurrencyCode": "USD",
        "pointOfServiceCapability": {
            "posTerminalType": "4",
            "posTerminalEntryCapability": "2"
        },
        "amount": "24.01",
        "pointOfServiceData": {
            "posConditionCode": "00",
            "panEntryMode": "90",
            "motoECIIndicator": "0"
        },
        "senderPrimaryAccountNumber": "4895100000055127"
    };
    parameters.payload.localTransactionDateTime = Date.now();

    return parameters;
}