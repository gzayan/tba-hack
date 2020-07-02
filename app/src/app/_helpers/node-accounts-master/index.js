const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const MemoryStore = require('memorystore')(session); // https://www.npmjs.com/package/memorystore
const methodOverride = require('method-override');
const mysql = require('mysql');
const fs = require('fs');

const app = express();

// for charities
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const initializePassport = require('./passport-config');
initializePassport(passport);

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

// seperate for charities
const conn = mysql.createConnection({
    host: 'db-mysql-tbahack-do-user-7692454-0.a.db.ondigitalocean.com',
    user: 'doadmin',
    password: 'vhm7v4y5awsdlgds',
    port: 25060,
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized: false,
        cert: fs.readFileSync('./ca-certificate.crt')
    }
});

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

app.post('/users/authenticate', checkNotAuthenticated, (req, res) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    });
    // console.log(req.body.email);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(JSON.stringify("Login works"));
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
})

app.post('/users/register', checkNotAuthenticated, async (req, res) => {
    try {
        const countryMap = new Map([
            ['USD', 'America'],
            ['CAD', 'Canada'],
            ['THB', 'Thailand'],
            ['EUR', 'Europe']
        ]);
        if(countryMap.get(req.body.country) == undefined) { // incorrect country code
            console.log("Undefined currency code");
            // res.redirect('/register');
        } 
        if(await emailAlreadyExists(req.body.email)) { // email already exists
            console.log("Email already exists");
            // res.redirect('/register');
        } 
        if(req.body.accountNumber.length != 16) { // incorrect length for account number
            console.log("Incorrect acc_num length");
            // res.redirect('/register');
        }
        else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const registrationID = Date.now().toString();
            var sql = "INSERT INTO USERS (userID, user_name, password, email, country, acc_num) VALUES ('{}', '{}', '{}', '{}', '{}', '{}')".format(
                registrationID,
                req.body.name,
                hashedPassword,
                req.body.email,
                countryMap.get(req.body.country),
                req.body.accountNumber
            );
            const newUser = await insertNewUser(sql);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(JSON.stringify("register works"));
        }
    } catch(err) {
        console.log("It's in the try catch");
        console.log(err);
        // res.redirect('/register');
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

function emailAlreadyExists(email) {
    return new Promise((resolve, reject) => {
        const exists = "SELECT COUNT(*) AS count FROM USERS WHERE email = '{}'".format(email);
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

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

const getCharities = 'SELECT * FROM CHARITIES';
conn.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("Connected to the mysql server!");
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

app.get('/users/:id', function (req, res) {
    var id = req.params.id;
    conn.query("SELECT user_name AS name, email, country FROM USERS" + " WHERE userId = '" + id + "'", function (err, result, fields) {
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

app.get('/users', (req, res) => {
    console.log('Got For users:', req.body);
    conn.query("SELECT user_name AS name, email, country FROM USERS", function (err, result, fields) {
        if (err) throw err;
        //console.log(result);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        console.log(JSON.stringify(result));
        res.end(JSON.stringify(result));
    });
});

app.listen(process.env.PORT || 4000);