const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'sqldatabase',
    database: 'charityDb',
    port: 3306
});

module.exports = pool;