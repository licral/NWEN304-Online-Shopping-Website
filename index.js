var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;
var pg = require('pg');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/test', function (req, res) {
    console.log("Got here");
    res.sendFile(__dirname + '/views/test.html');
});

app.listen(port, function () {
    console.log('Listening on port ' + port);
});