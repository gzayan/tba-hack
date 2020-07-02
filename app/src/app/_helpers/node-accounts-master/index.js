const express = require('express');
const mysql = require('mysql');
// const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const MemoryStore = require('memorystore')(session); // https://www.npmjs.com/package/memorystore
const methodOverride = require('method-override');
const Joi = require ('joi');
const bodyParser = require('body-parser');
const fs = require('fs');

'use strict';
var api = require('./funds_transfer_api/src/funds_transfer_api').funds_transfer_api;
var authCredentials = require('./funds_transfer_api/credentials.json');

var funds_transfer_api = new api(authCredentials);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const initializePassport = require('./passport-config');
initializePassport(passport);

const conn = mysql.createConnection({
    host: 'db-mysql-tbahack-do-user-7692454-0.a.db.ondigitalocean.com',
    user: 'doadmin',
    password: 'vhm7v4y5awsdlgds',
    port: 25060,
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized : false,
        cert : fs.readFileSync('./ca-certificate.crt')
    }  
});

conn.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("Connected to the mysql server!");

});

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

const pool = require('./pool.js'); // database configuration

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {
        user_name: req.user.user_name,
        email: req.user.email,
        acc_num: req.user.acc_num,
        country: req.user.country,
    });
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const countryMap = new Map([
            ['USD', 'America'],
            ['CAD', 'Canada'],
            ['THB', 'Thailand'],
            ['EUR', 'Europe']
        ]);
        if(countryMap.get(req.body.currencycode) == undefined || // incorrect country code
            await emailAlreadyExists(req.body.email) || // email already exists
            req.body.accountnumber.length != 16) { // incorrect length for account number
            res.redirect('/register'); // these three errors just redirect to the register view
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const registrationID = Date.now().toString();
            var sql = "INSERT INTO USERS (userID, user_name, password, email, country, acc_num) VALUES ('{}', '{}', '{}', '{}', '{}', '{}');".format(
                registrationID,
                req.body.name,
                hashedPassword,
                req.body.email,
                countryMap.get(req.body.currencycode),
                req.body.accountnumber
            );
            // console.log(sql);
            const newUser = await insertNewUser(sql);
            res.redirect('/login');
        }
    } catch(err) {
        console.log(err);
        res.redirect('/register');
    }
})

app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
})

app.post('/deleteaccount', async (req, res) => {
    req.logOut();
    const deleteFromDB = await deleteAccount(req.body.email);
    res.redirect('/login');
})

// STILL NEEDS TESTING
// Transfer money from one account to another.
app.post('/transfer', async (req, res) => {
    const bodySchema = {
        email: Joi.string().required(),
        amount: Joi.string().required()
    };
    if (!validateBody(req.body, bodySchema, req, res)) {
        return;
    }
    console.log("Endpoint reached");
    var sender = await findUserbyId(req.user.userId); // Idk if this works lol
    var recipient = await findUserbyEmail(req.body.email);

    if (sender == null || recipient == null) {
        res.send({
            success: false,
            message: 'User does not exist'
        });
        return;
    }
    if (sender == recipient) {
        res.send({
            success: false,
            message: 'Cannot transfer to self'
        });
        return;
    }

    var params = {};
    params.senderAccount = sender.acc_num;
    params.amount = req.body.amount;
    params.senderCurrencyCode = await findCurrencyByCountry(senderCountry).currency_code;
    params.recipientPrimaryAccountNumber = recipient.acc_num;
    params.senderName = sender.user_name;
    params.recipientName = recipient.user_name;

    if (senderCountry != recipientCountry) { // TODO: Double check this w/ Vishal
        params.foreignExchangeFeeTransaction = Math.floor((Math.random() * 10) + 1);
    } else {
        params.foreignExchangeFeeTransaction = 0;
    }


    transfer(params);
    
    var sql = "INSERT INTO TRANSFERS (user_one, user_two, transferAmount) VALUES ('{}', '{}', '{}');".format(
        req.user.userId,
        req.body.recipientUserId,
        req.body.amount,
    );
    await insertNewUser(sql);
    res.send({
        success: true,
        message: 'Funds successfully transferred'
    });
})

function emailAlreadyExists(email) {
    return new Promise((resolve, reject) => {
        const exists = "SELECT COUNT(*) AS count FROM users WHERE email = '{}'".format(email);
        pool.getConnection(function(err, connection) {
            if(err) throw err;
            connection.query(exists, function(err, results, fields) {
                if(results[0].count == 1) {
                    resolve(true);
                } else {
                    resolve(false);
                }
                connection.destroy();
            });
        });
    });
}

function insertNewUser(sql) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            if(err) throw err;
            connection.query(sql, function(err, results, fields) {
                if(err) throw err;
                resolve();
                connection.destroy();
            });
        })
    });
}

function deleteAccount(email) {
    return new Promise((resolve, reject) => {
        const remove = "DELETE FROM USERS WHERE email = '{}';".format(email);
        pool.getConnection(function(err, connection) {
            if(err) throw err;
            connection.query(remove, function(err, results, fields) {
                if(err) throw err;
                resolve();
                connection.destroy();
            });
        });
    });
}

// Official transfer of money between both accounts
function transfer(params) {
    funds_transfer_api.pullfunds(getPullParameters(params))
    .then(function (result) {
        if (result.response.statusCode == 200) {
            console.log('Funds pulled');
            funds_transfer_api.pushfunds(getPushParameters(params))
            .then(function(result) {
                if (result.response.statusCode == 200) {
                    console.log("funds pushed");
                }
            })
            .catch(function(error) {
                console.log(error);
            });
        }
    })
    .catch(function(error) {
        console.log(error);
    });
}

// Returns full payload of params for funds transfer api
function getPullParameters(params) {
    var parameters = {
        "x-client-transaction-id": "user_one",
        "Accept": "application/json",
        "Content-Type": "application/json"
    };
    parameters.payload = {
        "businessApplicationId": "AA",
        "cpsAuthorizationCharacteristicsIndicator": "Y",
        "senderCardExpiryDate": "2015-10",
        "amount": params.amount,
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
        // "nationalReimbursementFee": "11.22",
        "senderCurrencyCode": params.senderCurrencyCode,
        "cavv": "0700100038238906000013405823891061668252",
        "foreignExchangeFeeTransaction": params.foreignExchangeFeeTransaction,
        "addressVerificationData": {
            "postalCode": "12345",
            "street": "XYZ St"
        },
        "senderPrimaryAccountNumber": params.senderAccount,
        //"surcharge": "11.99"
    };
    parameters.payload.localTransactionDateTime = Date.now();

    return parameters;
}

// Returns full payload of params for funds transfer api
// TODO: senderAccountNumber vs senderReference?
function getPushParameters(attributes) {
    var parameters = {
        "x-client-transaction-id": "user_two",
        "Accept": "application/json",
        "Content-Type": "application/json"
    };
    parameters.payload = {
        "businessApplicationId": "AA",
        //"transactionIdentifier": "381228649430015",
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
        //"senderAddress": "901 Metro Center Blvd",
        //"sourceOfFundsCode": "02",
        "recipientName": params.recipientName,
        "senderName": params.senderName,
        //"senderStateCode": "CA",
        // "merchantCategoryCode": "6012",
        "acquirerCountryCode": "840",
        "senderReference": "",
        "recipientPrimaryAccountNumber": params.senderAccountNumber,
        "retrievalReferenceNumber": "412770451018",
        "senderAccountNumber": params.senderAccountNumber,
        "transactionCurrencyCode": params.senderCurrencyCode,
        "acquiringBin": "408999",
        // "pointOfServiceData": {
        //     "posConditionCode": "00",
        //     "panEntryMode": "90",
        //     "motoECIIndicator": "0"
        // },
        //"senderCity": "Foster City",
        "amount": params.amount,
        "systemsTraceAuditNumber": "451018",
        //"senderCountryCode": "124"
    };
    parameters.payload.localTransactionDateTime = Date.now();

    return parameters;
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

function validateBody(body, bodySchema, req, res) {
    const result = Joi.validate(body, bodySchema);
    if (result.error) {
    //   var errorMsg = 'Invalid body';
    //   winston.error(errorMsg, result.error);
      res.status(400).send({
        success: false,
        message: result.error.details[0].message,
      });
      return false;
    }
    return true;
  };

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

app.listen(4000);
console.log("Listening on port 4000");
