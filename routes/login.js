/**
 * Created by liaobonn on 18/05/17.
 *
 * Route used to handle login
 */
// var express = require('express');
// var router = express.Router();

module.exports = function(app, passport){

    app.get('/login', function (request, response) {
        if(request.user){
            request.flash('error', 'You must log out first before registering');
            response.redirect('/');
        }
        response.render('login', {
            title: 'Login',
            description: 'Log in to Vinylholics with an existing account.',
            message: request.flash('loginMessage'),
            error: request.flash('error')
        });
    });

    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', //where to go on success?
            failureRedirect : '/login',
            failureFlash : true
        }));

    // Redirect the user to Facebook for authentication.  When complete,
    // Facebook will redirect the user back to the application at
    //     /auth/facebook/callback
    app.get('/auth/facebook',
        passport.authenticate('facebook', {
        scope : ['email'],
        successRedirect: '/',
        failureRedirect: '/register' }));

    // Facebook will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            scope : ['email'],
            successRedirect: '/',
            failureRedirect: '/register' }));

};