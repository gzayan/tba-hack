const mysql = require('mysql');
const fs = require('fs');

// const conn = mysql.createConnection({
//     connectionLimit: 10,
//     host: 'db-mysql-tbahack-do-user-7692454-0.a.db.ondigitalocean.com',
//     user: 'doadmin',
//     password: 'vhm7v4y5awsdlgds',
//     port: 25060,
//     database: 'defaultdb',
//     ssl: {
//         rejectUnauthorized : false,
//         cert : fs.readFileSync('./ca-certificate.crt')
//     }
// });

// conn.connect(function(err) {
//     if (err) throw err;
//     conn.query("SELECT * FROM USERS", function (err, result, fields) {
//         if (err) throw err;
//         console.log(result);
//         conn.end();
//     });
// });

const pool = mysql.createPool({
    connectionLimit: 10,
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

// String.prototype.format = function () {
//     var i = 0, args = arguments;
//     return this.replace(/{}/g, function () {
//         return typeof args[i] != 'undefined' ? args[i++] : '';
//     });
// };

// const exists = "SELECT COUNT(*) AS count FROM USERS WHERE email = '{}'".format('oasfoif');
// pool.getConnection(function(err, connection) {
//     if(err) throw err;
//     connection.query(exists, function(err, results, fields) {
//         console.log(results);
//         // if(results[0].count == 1) {
//         //     resolve(true);
//         // } else {
//         //     resolve(false);
//         // }
//         connection.destroy();
//     });
// });

module.exports = pool;