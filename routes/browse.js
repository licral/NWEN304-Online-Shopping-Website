/**
 * Created by liaobonn on 18/05/17.
 *
 * Route used to handle all browse services
 */
var express = require('express');
var router = express.Router();

// =================== DB stuff ===================
const url = require('url');
const Pool = require('pg-pool');

// the local DB URL needs to be changed to your own settings
let localDBUrl = "postgresql://fangzhao:457866@localhost:5432/nwen304";
let databaseUrl = process.env.DATABASE_URL || localDBUrl;
let params = url.parse(databaseUrl);
let auth = params.auth.split(':');
let sslBoolean = !!process.env.DATABASE_URL;

let config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: sslBoolean
};

const pool = new Pool(config);

router.get('/all', function (req, res) {
    let pageData = {
        title: 'Browse All Vinyls',
        heading: 'All',
        description: "Browse all vinyl records",
    };

    pool.connect()
        .then(client => {
            let sql = "SELECT * FROM albums;";

            client.query(sql)
                .then(result => {
                    client.release();
                    pageData.albums = result.rows;
                    res.render('browse', pageData);

                    console.log(`[Log] Sending all ${result.rowCount} albums to the client`);
                })
                .catch(e => {
                    client.release();
                    pageData.error = "Database error occurred, please refresh or contact hectorcaesar@hotmail.com.";
                    res.render('browse', pageData);
                    console.error('[ERROR] Query error', e.message, e.stack);
                });
        })
        .catch(error => {
            pageData.error = "Database unavailable, please try again.";
            res.render('browse', pageData);
            console.error('[ERROR] Unable to connect to database', error.message, error.stack);
        });
});

router.get('/newest', function (req, res) {
    res.render('browse', {
        title: 'Browse Newest Arrivals',
        heading: 'Newest',
        description: "Browse the newest arrivals"
    });
});

module.exports = router;
