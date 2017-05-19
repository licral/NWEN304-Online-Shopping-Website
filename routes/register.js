/**
 * Created by liaobonn on 19/05/17.
 *
 * Route used to handle register
 */
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('register', {
        title: 'Register',
        description: 'Register for the new account.'
    });
});

module.exports = router;