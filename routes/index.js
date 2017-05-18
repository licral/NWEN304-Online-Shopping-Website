/**
 * Created by liaobonn on 18/05/17.
 *
 * Route used to handle the home url
 */
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('index', {
        title: 'Home',
        description: "Welcome to Vinylholics! Find those classic vinyls you have always been looking for and maybe stumble on a great deal for it!"
    });
});

module.exports = router;