/**
 * Created by liaobonn on 18/05/17.
 *
 * Route used to handle login
 */
// var express = require('express');
// var router = express.Router();

module.exports = function(app, passport){

    app.get('/login', function (req, res) {
        res.render('login', {
            title: 'Login',
            description: 'Log in to Vinylholics with an existing account.'
        });
    });

    app.post('/login', passport.authenticate('local-login', {
            //successRedirect : '/browse/all', //Where do we go on success
            failureRedirect : '/login',
            failureFlash : true
        }),
        function(req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        });

}