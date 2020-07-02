const LocalStrategy = require('passport-local').Strategy;
//const bcrypt = require('bcrypt');
const pool = require('./pool.js');

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        const user = await findUserByEmail(email);
        if (user == null) {
            return done(null, false, { message: 'No user with that email' });
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user); // Password correct
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch(err) {
            return done(err);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.userId));
    passport.deserializeUser(async (id, done) => {
        const foundById = await findUserById(id);
        return done(null, foundById);
    });
}

function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM USERS WHERE email = '{}'".format(email);
        pool.getConnection(function(err, connection) {
            if(err) throw err;
            connection.query(sql, function(err, results, fields) {
                if(Object.keys(results).length > 0) {
                    resolve(results[0]);
                } else {
                    resolve(null);
                }
                connection.destroy();
            });
        });
    });
}

function findUserById(id) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM USERS WHERE userId = '{}'".format(id);
        pool.getConnection(function(err, connection) {
            if(err) throw err;
            connection.query(sql, function(err, results, fields) {
                if(err) throw err;
                if(Object.keys(results).length > 0) {
                    resolve(results[0]);
                } else {
                    resolve(null);
                }
                connection.destroy();
            })
        });
    })
}

function findCurrencyByCountry(country) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM currency WHERE country = '{}'".format(country);
        pool.getConnection(function(err, connection) {
            if(err) throw err;
            connection.query(sql, function(err, results, fields) {
                if(err) throw err;
                if(Object.keys(results).length > 0) {
                    resolve(results[0]);
                } else {
                    resolve(null);
                }
                connection.destroy();
            })
        });
    })
}

module.exports = initialize;