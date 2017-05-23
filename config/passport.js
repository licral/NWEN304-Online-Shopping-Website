var LocalStrategy = require('passport-local').Strategy;

var pg = require('pg');
var bcrypt = require('bcrypt-nodejs');
//will need to adjust connection string to work
const connectionString = process.env.DATABASE_URL || 'postgres://qppxsuhjsvrdlo:34dc457da7ffb9749662aa55458d4348ccc595d12f41056e19b6a40ddf677551@ec2-23-23-227-188.compute-1.amazonaws.com:5432/d5h53moib4fj0q';

module.exports = function (passport, pool) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        pool.connect()
            .then((client, err) => {
                client.query("SELECT * FROM users WHERE id = ($1)", [id], function (err, result) {
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

                        client.query("SELECT * FROM users WHERE username = ($1)", [username], function (err, result) {
                            if (err)
                                return done(err);
                            if (result.rows.length) {
                                return done(null, false);
                            } else {

                                var newUser = {
                                    username: username,
                                    password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                                };

                                var insertQuery = "INSERT INTO users ( username, password ) values ($1,$2) RETURNING id";

                                client.query(insertQuery, [newUser.username, newUser.password], function (err, rows) {
                                    newUser.id = rows;

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
                            if (err)
                                return done(err);
                            if (!result.rows.length) {
                                return done(null, false);
                            }

                            if (!bcrypt.compareSync(password, result.rows[0].password)) {
                                return done(null, false);
                            }

                            return done(null, result.rows[0]);
                        });
                    })
            }));
};
