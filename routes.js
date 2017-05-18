// app/routes.js
var bcrypt = require('bcrypt-nodejs');

module.exports = function(app, passport) {
	app.get('/', function (req, res) {
    	res.sendFile(__dirname + '/index.html');
	});

	app.get('/test', function (req, res) {
	    console.log("Got here");
	    res.sendFile(__dirname + '/views/test.html');
	});

	app.get('/login', function(req, res) {
		//need login forms
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', //Where do we go on success
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

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/', //where to go on success?
		failureRedirect : '/signup', 
		failureFlash : true 
	}));

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});	
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

