/**
 * Created by liaobonn on 18/05/17.
 *
 * Route used to handle login
 */
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('login', {});
});

module.exports = router;