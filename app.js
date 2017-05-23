var express = require('express');
var session  = require('express-session');// needed for the passport
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');// <-- for better logging
var app = express();
var port = process.env.PORT || 3000;
var pg = require('pg');
var connectionPool = require('./config/database');

var passport = require('passport');
var flash = require('connect-flash');

require('./config/passport')(passport, connectionPool);

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

// For reading the body of our requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(session({
    secret: 'vinylholicssecretforauthentication',
    resave: true,
    saveUninitialized: true
} )); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

// Adding our route modules
var home = require('./routes/index');
require('./routes/login')(app, passport);
require('./routes/browse')(app, connectionPool);
require('./routes/register')(app, passport);
var logout = require('./routes/logout');

// Setting a path for our views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Setting a path for our resources
app.use(express.static(__dirname + '/public'));

// Defining all our routes
app.use('/', home);


app.listen(port, function () {
    console.log('Listening on port ' + port);
});

module.exports = app;