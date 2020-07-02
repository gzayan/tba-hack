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

// path invoked is '/visadirect/fundstransfer/v1/pushfundstransactions';
funds_transfer_api.pushfunds(getParameters())
    .then(function(result) {
        // Put your custom logic here
        console.log('\n Response: ' + JSON.stringify(result.response));
        console.log('\n Response Status: ' + JSON.stringify(result.response.statusCode));
        console.log('\n--------------- Above product is Visa Direct ---------------');
        console.log('\n--------------- API is Funds Transfer Api ---------------');
        console.log('\n--------------- EndPoint is pushfunds ---------------');
        console.log('\n\n');
    })
    .catch(function(error) {
        console.log('\n Response: ' + JSON.stringify(error.response));
        console.log('\n Response Status: ' + JSON.stringify(error.response.statusCode));
        console.log('\n--------------- Above product is Visa Direct ---------------');
        console.log('\n--------------- API is Funds Transfer Api ---------------');
        console.log('\n--------------- EndPoint is pushfunds ---------------');
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
        "transactionIdentifier": "381228649430015",
        "cardAcceptor": {
            "idCode": "CA-IDCode-77765",
            "address": {
                "county": "San Mateo",
                "country": "USA",
                "state": "CA",
                "zipCode": "94404"
            },
            "terminalId": "TID-9999",
            "name": "Visa Inc. USA-Foster City"
        },
        "senderAddress": "901 Metro Center Blvd",
        "sourceOfFundsCode": "05",
        "recipientName": "rohan",
        "senderName": "Mohammed Qasim",
        "senderStateCode": "CA",
        "merchantCategoryCode": "6012",
        "acquirerCountryCode": "840",
        "senderReference": "",
        "recipientPrimaryAccountNumber": "4957030420210496",
        "retrievalReferenceNumber": "412770451018",
        "senderAccountNumber": "4653459515756154",
        "transactionCurrencyCode": "USD",
        "acquiringBin": "408999",
        "pointOfServiceData": {
            "posConditionCode": "00",
            "panEntryMode": "90",
            "motoECIIndicator": "0"
        },
        "senderCity": "Foster City",
        "amount": "124.05",
        "systemsTraceAuditNumber": "451018",
        "senderCountryCode": "124"
    };
    parameters.payload.localTransactionDateTime = Date.now();

    return parameters;
}