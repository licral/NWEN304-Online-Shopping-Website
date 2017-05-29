var express = require('express');
var session  = require('express-session');// needed for the passport
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');// <-- for better logging
var app = express();
var port = process.env.PORT || 8080;
var pg = require('pg');
var connectionPool = require('./config/database');
var path = require('path');
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({storage: storage});
app.use(upload.single('image'));

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

app.use(function(req, res, next){
    if(req.user){
        res.locals.username = req.user.username;
        res.locals.isLoggedIn = true;
    } else {
        res.locals.username = "None";
        res.locals.isLoggedIn = false;
    }
    next();
});

// Adding our route modules
require('./routes/index')(app);
require('./routes/login')(app, passport);
require('./routes/browse')(app, connectionPool);
require('./routes/register')(app, passport);
require('./routes/logout')(app);
require('./routes/item')(app, connectionPool);
require('./routes/upload')(app, connectionPool);
require('./routes/image')(app, connectionPool, path);

require('./routes/search')(app, connectionPool);

// Setting a path for our views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Setting a path for our resources
app.use(express.static(__dirname + '/public'));

app.listen(port, function () {
    console.log('Listening on port ' + port);
});

module.exports = app;