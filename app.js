var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;
var pg = require('pg');

// Adding our route modules
var home = require('./routes/index');

// Setting a path for our views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Setting a path for our resources
app.use(express.static(__dirname + '/public'));

// For reading the body of our requests
app.use(bodyParser.json());

// Defining all our routes
app.use('/', home);

app.listen(port, function () {
    console.log('Listening on port ' + port);
});

module.exports = app;