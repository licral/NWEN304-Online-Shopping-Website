/**
 * Created by liaobonn on 18/05/17.
 *
 * Route used to handle all browse services
 */
var express = require('express');
var router = express.Router();

router.get('/all', function (req, res) {
    res.render('browse', {
        title: 'Browse All Vinyls',
        heading: 'All'
    });
});

router.get('/newest', function (req, res) {
    res.render('browse', {
        title: 'Browse Newest Arrivals',
        heading: 'Newest'
    });
});

module.exports = router;