const mysql = require('mysql');
const fs = require('fs');

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