const mysql = require('mysql');

const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sqldatabase",
    port: 3306
});

conn.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("Connected to the mysql server!");

    let queryCreateDatabase = "CREATE DATABASE IF NOT EXISTS charityDb;";

    conn.query(queryCreateDatabase, (err, result) => {
        if (err) {
            throw err;
        }
        console.log("Database create successfully !")
    })

    conn.end((err) => {
        if (err) {
            throw err;
        }
        console.log("Connection ended");
    })
});