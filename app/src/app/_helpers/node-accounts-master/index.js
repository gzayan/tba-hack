const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const MemoryStore = require('memorystore')(session); // https://www.npmjs.com/package/memorystore
const methodOverride = require('method-override');

const app = express();

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

app.listen(process.env.PORT || 5000);