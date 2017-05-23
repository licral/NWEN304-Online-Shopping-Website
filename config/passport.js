
var LocalStrategy = require('passport-local').Strategy;

var pg = require('pg');
var bcrypt = require('bcrypt-nodejs');
//will need to adjust connection string to work
const connectionString = process.env.DATABASE_URL || 'postgres://Butlerslad:password@localhost:5432/nwenprod';

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = ($1) ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            pg.connect(connectionString, function(err,client){
                if(err){
                   return done(err); 
                }

                client.query("SELECT * FROM users WHERE username = ($1)",[username], function(err, result) {
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

                        client.query(insertQuery,[newUser.username, newUser.password],function(err, rows) {
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
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, username, password, done) { 
            pg.connect(connectionString, function(err,client){
                if(err){
                   return done(err); 
                }
                client.query("SELECT * FROM users WHERE username = ($1)",[username], function(err, result){
                    if (err)
                        return done(err);
                    if (!result.rows.length) {
                        return done(null, false); 
                    }

                    if (!bcrypt.compareSync(password, result.rows[0].password)){
                        return done(null, false); 
                    }

                    return done(null, result.rows[0]);
                });
            });
        })
    );
};
