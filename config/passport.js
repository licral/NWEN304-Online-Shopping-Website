var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var auth = require('./auth');


var pg = require('pg');
var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');

var usersDAO = require('../data_access_objects/users_DAO');

module.exports = function (passport, pool) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
         pool.query("SELECT * FROM users WHERE id = ($1)", [id], function (err, result) {
             done(err, result.rows[0]);
         });
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (request, username, password, done) {
                //Lets do some server side validation because we don't trust the client
                if(!validator.isEmail(request.body.email)){
                    return done(null, false, request.flash('signupMessage', 'Invalid Email.'));
                }

                if(username == '') {
                    return done(null, false, request.flash('signupMessage', 'Username not provided.'));
                }

                if(request.body.password != request.body.confpassword) {
                    return done(null, false, request.flash('signupMessage', 'Passwords do not match.'));
                }

                pool.connect()
                    .then((client, err) => {
                        if (err) {
                            client.release();
                            return done(err);
                        }

                        client.query("SELECT * FROM users WHERE email = ($1)", [request.body.email], function (err, result) {
                            if (err) {
                                client.release();
                                return done(err);
                            }

                            if (result.rows.length) {
                                client.release();
                                return done(null, false, request.flash('signupMessage', 'That email already has an account.'));
                            }


                            client.query("SELECT * FROM users WHERE username = ($1)", [username], function (err, result) {
                                if (err) {
                                    client.release();
                                    return done(err);
                                }

                                if (result.rows.length) {
                                    client.release();
                                    return done(null, false, request.flash('signupMessage', 'That username is already taken.'));
                                } else {

                                    var newUser = {
                                        username: username,
                                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                                    };

                                    // use the transaction function to set up the user
                                    var insertQuery = "SELECT insert($1,$2,$3,$4)";

                                    client.query(insertQuery, [newUser.username, newUser.password, request.body.email, newUser.username], function (err, result) {
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
            function (request, username, password, done) {

                usersDAO.getRow([username], pool, function(err,msg,results) {
                    if (err) {
                        return done(err);
                    }

                    if (!results.rows.length) {
                        return done(null, false, request.flash('loginMessage', 'Incorrect username/password'));
                    }

                    if (!bcrypt.compareSync(password, results.rows[0].password)) {
                        return done(null, false, request.flash('loginMessage', 'Incorrect username/password'));
                    }

                    return done(null, results.rows[0]);
                });
            }));


    passport.use(new FacebookStrategy({
            clientID: auth.facebook.clientID,
            clientSecret: auth.facebook.secret,
            callbackURL: auth.facebook.callback,
            assReqToCallback : true,
            profileFields: ['id','email','first_name', 'last_name', 'displayName' ],
            enableProof: true
        },
        function(accessToken, refreshToken, profile, done) {
            usersDAO.getRow([profile.id], pool, function(err, msg, result){
                if(err){
                    return done(err);
                }

                if(result.rows.length > 0){
                    return done(null, result.rows[0]);
                }

                var newUser = {
                    // set all of the facebook information in our user model
                    username : profile.displayName,
                    facebook_id : profile.id, // set the users facebook id
                    token : accessToken // we will save the token that facebook provides to the user
                };

                if(profile.emails !== undefined){
                    newUser.email = profile.emails[0].value;
                }

                var insertQuery = "SELECT insert($1,$2,$3,$4)";

                pool.query(insertQuery, [newUser.facebook_id, newUser.token, newUser.email, newUser.username], function (err, result) {
                    if (err) {
                        return done(err);
                    }

                    newUser.id = result.rows[0].insert;

                    return done(null, newUser);
                });
            })
        }
    ));
};
