//server

//======Server Imports===========
var express = require('express');
var session  = require('express-session');// needed for the passport
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');// <-- for better logging
var app = express();
var port = process.env.PORT || 3000;
var pg = require('pg');

var passport = require('passport');
var flash = require('connect-flash');
//================================

require('./config/passport')(passport); 

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.use(session({
	//secret: 'vidyapathaisalwaysrunning',
	secret: 'vinylholicssecretforauthentication',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

require('./routes.js')(app, passport);

app.listen(port, function () {
    console.log('Listening on port ' + port);
});