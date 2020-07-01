const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'Insert username here',
    password: 'Insert password here',
    database: 'Insert database name here'
});

module.exports = pool;