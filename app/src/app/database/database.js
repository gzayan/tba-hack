const mysql = require('mysql');

const pool = mysql.createPool({
    // host: 'localhost',
    // user: 'root',
    // password: 'sqldatabase',
    // database: 'charityDb',
    // port: 3306
    
    host: 'db-mysql-tbahack-do-user-7692454-0.a.db.ondigitalocean.com',
    user: 'doadmin',
    password: 'vhm7v4y5awsdlgds',
    port: 25060,
    database: 'defaultdb'
});

module.exports = pool;