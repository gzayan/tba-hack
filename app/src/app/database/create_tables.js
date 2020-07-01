const mysql = require('mysql');

const db = require('./database');

// Statements for dropping all tables
const dropTransfers = "DROP TABLE IF EXISTS TRANSFERS;";
const dropUsers = "DROP TABLE IF EXISTS USERS;";
const dropCurrencies = "DROP TABLE IF EXISTS CURRENCY;";
const dropCharities = "DROP TABLE IF EXISTS CHARITIES;";
const dropDonations = 'DROP TABLE IF EXISTS DONATIONS;';

// Statements for creating the tables
const createUsers = `CREATE TABLE USERS(
    userId VARCHAR(255) NOT NULL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    password VARCHAR(500) NOT NULL,
    email VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    acc_num VARCHAR(16) NOT NULL,
    FOREIGN KEY (country) REFERENCES CURRENCY(country) ON DELETE CASCADE
)`;

const createCurrency = `CREATE TABLE CURRENCY(
    country VARCHAR(255) NOT NULL PRIMARY KEY,
    currency_code VARCHAR(255) NOT NULL
);`;

const createCharities = `CREATE TABLE CHARITIES (
    charityId VARCHAR(255) NOT NULL PRIMARY KEY,
    charityName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    acc_num VARCHAR(16) NOT NULL,
    FOREIGN KEY (country) REFERENCES CURRENCY(country) ON DELETE CASCADE
 );`;
const createTransfers = `CREATE TABLE TRANSFERS(
    transId int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_one VARCHAR(255) NOT NULL,
    user_two VARCHAR(255) NOT NULL,
    transferAmount int NOT NULL,
    FOREIGN KEY (user_one) REFERENCES USERS(userId) ON DELETE CASCADE,
    FOREIGN KEY (user_two) REFERENCES USERS(userId) ON DELETE CASCADE
);`;

const createDonations = `CREATE TABLE DONATIONS(
    transId int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    charity_id VARCHAR(255) NOT NULL,
    transferAmount int NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USERS(userId) ON DELETE CASCADE,
    FOREIGN KEY (charity_id) REFERENCES CHARITIES(charityId) ON DELETE CASCADE
);`;

// Execute all the queries and set up the database
db.getConnection((err, conn) =>{
    conn.query(dropTransfers, (err) => {
        if (err) throw err;
        console.log('Dropped Transfers');
    });
    conn.query(dropDonations, (err) => {
        if (err) throw err;
        console.log('Dropped Donations');
    });
    conn.query(dropUsers, (err) => {
        if (err) throw err;
        console.log('Dropped Users');
    });
    conn.query(dropCharities, (err) => {
        if (err) throw err;
        console.log('Dropped Charities');
    });
    conn.query(dropCurrencies, (err) => {
        if (err) throw err;
        console.log('Dropped Currencies');
    });

    conn.query(createCurrency, (err) => {
        if (err) throw err;
        console.log('Created Currencies');
    });

    conn.query(createUsers, (err) => {
        if (err) throw err;
        console.log('Created Users');
    });
   
    conn.query(createCharities, (err) => {
        if (err) throw err;
        console.log('Created Charities');
    });

    conn.query(createTransfers, (err) => {
        if (err) throw err;
        console.log('Created Transfers');
    });
   
    conn.query(createDonations, (err) => {
        if (err) throw err;
        console.log('Created Donations');
    });

    conn.release();
});




