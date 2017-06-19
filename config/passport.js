var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;


var pg = require('pg');
var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');

var usersDAO = require('../data_access_objects/users_DAO');

module.exports = function (passport, pool) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        pool.connect()
            .then((client, err) => {
                client.query("SELECT * FROM users WHERE id = ($1)", [id], function (err, result) {
                    client.release();
                    done(err, result.rows[0]);
                });
            });
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, username, password, done) {
                //Lets do some server side validation because we don't trust the client
                if(!validator.isEmail(req.body.email)){
                    return done(null, false, req.flash('signupMessage', 'Invalid Email.'));
                }

                if(username == '') {
                    return done(null, false, req.flash('signupMessage', 'Username not provided.'));
                }

                if(req.body.password != req.body.confpassword) {
                    return done(null, false, req.flash('signupMessage', 'Passwords do not match.'));
                }

                pool.connect()
                    .then((client, err) => {
                        if (err) {
                            client.release();
                            return done(err);
                        }

                        client.query("SELECT * FROM user_details WHERE email = ($1)", [req.body.email], function (err, result) {
                            if (err) {
                                client.release();
                                return done(err);
                            }

                            if (result.rows.length) {
                                client.release();
                                return done(null, false, req.flash('signupMessage', 'That email already has an account.'));
                            }


                            client.query("SELECT * FROM users WHERE username = ($1)", [username], function (err, result) {
                                if (err) {
                                    client.release();
                                    return done(err);
                                }

                                if (result.rows.length) {
                                    client.release();
                                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                                } else {

                                    var newUser = {
                                        username: username,
                                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                                    };

                                    // use the transaction function to set up the user
                                    var insertQuery = "SELECT insert($1,$2,$3)";

                                    client.query(insertQuery, [newUser.username, newUser.password, req.body.email], function (err, result) {
                                        client.release();
                                        if (err) {
                                            return done(err);
                                        }

                                        newUser.id = result.rows[0].insert;

                                        return done(null, newUser);
                                    });
                                }
                            });
                        });
                });
            })
    );


    passport.use(
        'local-login',
        new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req, username, password, done) {

                usersDAO.getRow([username], pool, function(err,msg,results) {
                    if (err) {
                        return done(err);
                    }

                    if (!results.rows.length) {
                        return done(null, false, req.flash('loginMessage', 'Incorrect username/password'));
                    }

                    if (!bcrypt.compareSync(password, results.rows[0].password)) {
                        return done(null, false, req.flash('loginMessage', 'Incorrect username/password'));
                    }

                    return done(null, results.rows[0]);
                });
            }));
};
