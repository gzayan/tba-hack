
const http = require('http');
const url = require('url');

const express = require('express');
const bodyParser = require('body-parser');

const mysql = require('mysql');
const fs = require('fs');

const conn = mysql.createConnection({
    host: 'db-mysql-tbahack-do-user-7692454-0.a.db.ondigitalocean.com',
    user: 'doadmin',
    password: 'vhm7v4y5awsdlgds',
    port: 25060,
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized: false,
        cert: fs.readFileSync('./src/ca-certificate.crt')
    }
});

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

const createDonations = `CREATE TABLE DONATIONS_TEST(
    transId int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    charity_id VARCHAR(255) NOT NULL,
    transferAmount int NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USERS(userId) ON DELETE CASCADE,
    FOREIGN KEY (charity_id) REFERENCES CHARITIES(charityId) ON DELETE CASCADE
);`;

const getCharities = 'SELECT * FROM CHARITIES';
conn.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("Connected to the mysql server!");

});

conn.query(getCharities, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * function makeSampleRequest(res, senderCurrencyCode , 
    amount , senderAccount , senderName , recipientName)

    { charityName: 'abc', amount: '10', user: 1 }
 */
app.post('/donation', (req, res) => {
    console.log('Got body:', req.body);
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    conn.query("SELECT * FROM USERS WHERE userId = {}".format(req.body.user), function (err, result, fields) {
        if (err) throw err;
        //console.log(result);

        senderCurrency = result[0].country;
        amount = req.body.amount;
        senderAccount = result[0].acc_num;
        senderAccount = 48951422309736;
        senderName = result[0].user_name;
        recipientName = req.body.charityName;
        makeSampleRequest(res, senderCurrency , 
            amount , senderAccount , senderName , recipientName)
    });
});

app.get('/charities/:id', function (req, res) {
    var id = req.params.id;
    conn.query(getCharities + " WHERE charityId = '" + id + "'", function (err, result, fields) {
        if (err) throw err;
        //console.log(result);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(JSON.stringify(result));
    });
});

/**
 *   id: string;
    charityName: string;
    accountNumber: string;
    country: string;
    email: string;
 */
app.post('/charities/register', function (req, res) {
    //var id = req.body;
    var name = req.body.charityName;
    var accountNumber = req.body.accountNumber;;
    var country = req.body.country;;
    var email = req.body.email;;
    console.log(name);

    conn.query("INSERT INTO CHARITIES VALUES ('" + email + "' , '" +
        name + "' , '" + email + "' , '" + country + "', '" + accountNumber + "' ) ", function (err, result, fields) {
            if (err) throw err;
            //console.log(result);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(JSON.stringify(result));
        });

});

app.delete('/charities/:id', function (req, res) {
    var id = req.params.id;
    conn.query(+ "DELETE FROM CHARITIES WHERE charityId = '" + id + "'", function (err, result, fields) {
        if (err) throw err;
        //console.log(result);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        //res.end(JSON.stringify(result));
    });
});

app.get('/charities', (req, res) => {
    console.log('Got For charities:', req.body);
    conn.query(getCharities, function (err, result, fields) {
        if (err) throw err;
        //console.log(result);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(JSON.stringify(result));
    });
});

app.listen(4000, () => console.log(`Started server at http://localhost:4000!`));

// Create an instance of the http server to handle HTTP requests
// let app = http.createServer((req, res) => {
//     // Set a response type of plain text for the response
//     //const queryObject = url.parse(req.b,true).query;
//     console.log(req.url);

//     switch (req.url) {
//         case "/donation":
//             console.log("Full request = " + req);
//             console.log("Here " + req.body);
//             res.writeHead(200, { 'Content-Type': 'text/plain' });
//            // makeSampleRequest(res);
//             break;
//         case "/charities" :

//             break;
//     }

// });

// Start the server on port 4000
// app.listen(4000, '127.0.0.1');
// console.log('Node server running on port 4000');



/**
 * +----------+---------------+
| country  | currency_code |
+----------+---------------+
| America  | USD           |
| Canada   | CAD           |
| Europe   | EUR           |
| Thailand | THB           |
+----------+---------------+

 */

const currency_codes = {
    "America": "USD",
    "Canada": "CAD",
    "Eurpoe": "EUR",
    "Thailand": "THB"
}

function makeSampleRequest(res, senderCurrency,
    amount, senderAccount, senderName, recipientName) {
    'use strict';
    var api = require('../src/funds_transfer_api').funds_transfer_api;
    var authCredentials = require('../credentials.json');

    var funds_transfer_api = new api(authCredentials);

    var working = false;
    var senderCountry = "USA";
    var recepientCountry = "CAN";

    console.log("Test");

    var attributes = {};
    attributes.senderAccount = senderAccount;
    attributes.amount = amount;
    attributes.senderCurrencyCode = currency_codes[senderCurrency];

    if (senderCountry != recepientCountry) {
        attributes.foreignExchangeFeeTransaction = Math.floor((Math.random() * 10) + 1);
    } else {
        attributes.foreignExchangeFeeTransaction = 0;
    }

    attributes.senderName = senderName;
    attributes.recipientName = recipientName;

    console.log(JSON.stringify(attributes));

    console.log("We are here");
    console.log(JSON.stringify(getPullParameters(attributes)));
    funds_transfer_api.pullfunds(getPullParameters(attributes))
        .then(function (result) {

            console.log('Pull is:' + JSON.stringify(result.response));

            console.log("Status code = " + result.response.statusCode);
            if (result.response.statusCode == 200) {
                console.log("Funds got pulled");
                funds_transfer_api.pushfunds(getPushParameters(attributes))
                    .then(function (result2) {
                        // Put your custom logic here
                        console.log('\n Push is: ' + JSON.stringify(error.response));
                        if (result2.response.statusCode == 200 || result2.response.statusCode == 303) {
                            console.log("Funds got pushed. Transaction is successful");
                            res.writeHead(200, { 'Content-Type': 'text/plain' });

                            // Send back a response and end the connection
                            res.end('Hello from the function!\n');
                        }
                    })
                    .catch(function (error) {
                        console.log('\n Response: ' + JSON.stringify(error));
                        //console.log('\n Response Status: ' + JSON.stringify(result.response.statusCode));
                        console.log('\n--------------- Above product is Visa Direct ---------------');
                        console.log('\n--------------- API is Funds Transfer Api ---------------');
                        console.log('\n--------------- EndPoint is pushFunds ---------------');
                        console.log('\n\n');

                
                        console.log("Sending response back");
                        res.writeHead(200, { 'Content-Type': 'text/plain' });

                        // Send back a response and end the connection
                        res.end('Hello from the function!\n');
                        if (error.response.statusCode == 200 || error.response.statusCode == 303) {
                            console.log("Funds got pushed. Transaction is successful");
                            res.writeHead(200, { 'Content-Type': 'text/plain' });

                            // Send back a response and end the connection
                            res.end('Hello from the function!\n');
                        }
                    });
            }
        })
        .catch(function (error) {
            console.log('\n Response: ' + JSON.stringify(error));
            //console.log('\n Response Status: ' + JSON.stringify(result.response.statusCode));
            console.log('\n--------------- Above product is Visa Direct ---------------');
            console.log('\n--------------- API is Funds Transfer Api ---------------');
            console.log('\n--------------- EndPoint is pullfunds ---------------');
            console.log('\n\n');

            console.log("Funds got pulled");
            funds_transfer_api.pushfunds(getPushParameters(attributes))
                .then(function (result2) {
                    // Put your custom logic here
                    console.log('\n Push is: ' + JSON.stringify(error.response));
                    if (result2.response.statusCode == 200 || result2.response.statusCode == 303) {
                        console.log("Funds got pushed. Transaction is successful");
                        res.writeHead(200, { 'Content-Type': 'text/plain' });

                        // Send back a response and end the connection
                        res.end('Hello from the function!\n');
                    }
                })
                .catch(function (error) {
                    console.log('\n Response: ' + JSON.stringify(error));
                    //console.log('\n Response Status: ' + JSON.stringify(result.response.statusCode));
                    console.log('\n--------------- Above product is Visa Direct ---------------');
                    console.log('\n--------------- API is Funds Transfer Api ---------------');
                    console.log('\n--------------- EndPoint is push ---------------');
                    console.log('\n\n');

                    if (error.response.statusCode == 200 || error.response.statusCode == 303) {
                        console.log("Funds got pushed. Transaction is successful");
                        res.writeHead(200, { 'Content-Type': 'text/plain' });

                        // Send back a response and end the connection
                        res.end('Hello from the function!\n');
                    }
                });
        });

}

function getPullParameters(attributes) {
    var parameters = {
        "x-client-transaction-id": "Vishal"+Date.now(),
        "Accept": "application/json",
        "Content-Type": "application/json"
    };
    parameters.payload = {
        "businessApplicationId": "AA",
        "cpsAuthorizationCharacteristicsIndicator": "Y",
        "senderCardExpiryDate": "2015-10",
        "amount": "100",
        "acquirerCountryCode": "840",
        "retrievalReferenceNumber": "330000550000",
        "cardAcceptor": {
            "idCode": "ABCD1234ABCD123",
            "address": {
                "county": "081",
                "country": "USA",
                "state": "CA",
                "zipCode": "94404"
            },
            "terminalId": "ABCD1234",
            "name": "Visa Inc. USA-Foster City"
        },
        "acquiringBin": "408999",
        "systemsTraceAuditNumber": "451001",
        "nationalReimbursementFee": "11.22",
        "senderCurrencyCode": attributes.senderCurrencyCode,
        "cavv": "0700100038238906000013405823891061668252",
        "foreignExchangeFeeTransaction": "11.99",
        "addressVerificationData": {
            "postalCode": "12345",
            "street": "XYZ St"
        },
        "senderPrimaryAccountNumber": "4895142232120006",
        "surcharge": "11.99"
    };
    parameters.payload.localTransactionDateTime = Date.now();

    return parameters;
}

function getPushParameters(attributes) {
    //console.log("Trying to push with" + JSON.stringify(attributes));
    var parameters = {
        "x-client-transaction-id": "Vishal"+Date.now(),
        "Accept": "application/json",
        "Content-Type": "application/json"
    };
    parameters.payload = {
        "businessApplicationId": "AA",
        "transactionIdentifier": "381228649430015",
        "cardAcceptor": {
            "idCode": "VMT200911086070",
            "address": {
                "county": "San Mateo",
                "country": "CAN",
                "state": "AB",
                "zipCode": "94404"
            },
            "terminalId": "TID-9999",
            "name": "Visa Inc. USA-Foster City"
        },
        "senderAddress": "901 Metro Center Blvd",
        "sourceOfFundsCode": "05",
        "recipientName": attributes.recipientName,
        "senderName": attributes.senderName,
        "senderStateCode": "CA",
        "merchantCategoryCode": "6012",
        "acquirerCountryCode": "999",
        "senderReference": "",
        "recipientPrimaryAccountNumber": "4957030420210496",
        "retrievalReferenceNumber": "412770451018",
        "senderAccountNumber": "4653459515756154",
        "transactionCurrencyCode": "THB",
        "acquiringBin": "400171",
        "pointOfServiceData": {
            "posConditionCode": "00",
            "panEntryMode": "90",
            "motoECIIndicator": "0"
        },
        "senderCity": "Foster City",
        "amount": attributes.amount,
        "systemsTraceAuditNumber": "451018",
        "senderCountryCode": "124"
    };
    parameters.payload.localTransactionDateTime = Date.now();

    return parameters;
}
