var session  = require('express-session');// needed for the passport
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');// <-- for better logging
//var app = express();
var port = process.env.PORT || 8080;
var pg = require('pg');
var connectionPool = require('./config/database');
var path = require('path');
var multer = require('multer');

var storage = multer.memoryStorage();
var upload = multer({storage: storage});

var passport = require('passport');
var flash = require('connect-flash');

//for https
var https = require('https');
var fs = require('fs');

var key = fs.readFileSync('pems/vinylholicskey.pem');
var cert = fs.readFileSync('pems/certificate.pem');

var options = {
    key: key,
    cert: cert
};


var express = require('express');
var app = express();

require('./config/passport')(passport, connectionPool);

//========================================
// Config app
//========================================

// force http to https
app.use(function (request, response, next) {
    if (!request.headers.host.startsWith("localhost") && request.headers['x-forwarded-proto'] !== 'https') {
        let httpsUrl = ['https://vinylholics.herokuapp.com', request.url].join('');
        return response.redirect(httpsUrl);
    }

    return next();
});

app.use(upload.single('image'));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

// For reading the body of our requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(session({
    secret: 'vinylholicssecretforauthentication',
    cookie: { maxAge: 300000},
    resave: true,
    saveUninitialized: true
} )); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

app.use(function(req, res, next){
    if(req.user){
        res.locals.displayname = req.user.displayname;
        res.locals.username = req.user.username;
        res.locals.isAdmin = req.user.is_admin;
        res.locals.isLoggedIn = true;
        res.locals.userId = req.user.id;
    } else {
        res.locals.username = "None";
        res.locals.isLoggedIn = false;
    }
    next();
});

// Setting a path for our views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Setting a path for public resources
app.use(express.static(__dirname + '/public', {
    maxage: "1y"   // caching public files
}));

//========================================
// Add routes
//========================================
require('./routes/index')(app, connectionPool);
require('./routes/login')(app, passport);
require('./routes/browse')(app, connectionPool);
require('./routes/profile')(app, connectionPool);
require('./routes/register')(app, passport);
require('./routes/logout')(app);
require('./routes/item')(app, connectionPool);
require('./routes/artist')(app, connectionPool);
require('./routes/image')(app, connectionPool, path);
require('./routes/search')(app, connectionPool);
require('./routes/shopping_cart')(app, connectionPool);
require('./routes/order')(app, connectionPool);
require('./routes/manage')(app, connectionPool);
require('./routes/archive')(app, connectionPool);
require('./routes/add')(app, connectionPool);
require('./routes/404')(app);
require('./routes/access_denied')(app);

//========================================
// create https server paid resource
//========================================
// https.createServer(options,app).listen(port, function () {
//     console.log('Listening on port ' + port);
// });

//========================================
// create standard http
//========================================
app.listen(port, function () {
    console.log('Listening on port ' + port);
});

module.exports = https;
