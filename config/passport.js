var LocalStrategy = require('passport-local').Strategy;

var pg = require('pg');
var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');

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
                pool.connect()
                    .then((client, err) => {
                        if (err) {
                            return done(err);
                        }

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


                        client.query("SELECT * FROM users WHERE username = ($1)", [username], function (err, result) {
                            client.release();
                            if (err)
                                return done(err);
                            if (result.rows.length) {
                                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                            } else {

                                var newUser = {
                                    username: username,
                                    password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                                };

                                var insertQuery = "INSERT INTO users ( username, password ) values ($1,$2) RETURNING id";

                                client.query(insertQuery, [newUser.username, newUser.password], function (err, result) {
                                    newUser.id = result.rows[0].id;
                                    return done(null, newUser);
                                });
                            }
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
                pool.connect()
                    .then((client, err) => {
                        if (err) {
                            return done(err);
                        }

                        client.query("SELECT * FROM users WHERE username = ($1)", [username], function (err, result) {
                            client.release();
                            if (err)
                                return done(err);
                            if (!result.rows.length) {
                                return done(null, false, req.flash('loginMessage', 'No user found.'));
                            }

                            if (!bcrypt.compareSync(password, result.rows[0].password)) {
                                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                            }
                            return done(null, result.rows[0]);
                        });
                    })
            }));
};
