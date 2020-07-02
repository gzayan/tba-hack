const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'M1crosoft!',
    database: 'tba'
});

module.exports = pool;