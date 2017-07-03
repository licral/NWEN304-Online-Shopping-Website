/**
 * Created by liaobonn on 18/05/17.
 *
 * Route used to handle all browse services
 */

module.exports = function (app, pool) {
    app.get('/browse/artist', function (req, res) {
        let pageData = {
            title: 'Browse Artists',
            heading: 'Artists',
            description: "Browse all artists of the vinyls we sell."
        };

        let sql = "SELECT id, artist_name FROM artists";

        pool.query(sql)
            .then(result => {
                pageData.artists = result.rows;

                res.set({
                    'Cache-Control': 'public, no-cache, must-revalidate',
                    'Expires': new Date(Date.now() + 86400000).toUTCString()
                }).render('browse', pageData);
            })
            .catch(e => {
                pageData.error = "Database error occurred, please refresh or contact hectorcaesar@hotmail.com.";
                res.render('browse', pageData);
                console.error('[ERROR] Query error', e.message, e.stack);
            });
    });

    app.get('/browse/page/:offset', function (req, res) {
        let pageData = {
            title: 'Browse All Vinyls',
            heading: 'All',
            description: "Browse all vinyl records",
        };

        let offset = (req.params.offset - 1) * 10;
        let sql = "select a.id, a.title, a.price, b.artist_name from albums a join artists b on a.artist_id=b.id order by a.title limit 10 offset $1;";

        pool.query(sql, [offset])
            .then(result => {
                sql = "select count(id) from albums;";
                pool.query(sql)
                    .then(result2 => {
                        pageData.albums = result.rows;
                        var count = result2.rows[0].count;
                        count = Math.round(count / 10);
                        pageData.count = count;
                        pageData.current_page = req.params.offset;
                        res.set({
                            'Cache-Control': 'public, no-cache, must-revalidate'
                        }).render('browse', pageData);
                    })
                    .catch(e2 => {
                        console.error('[ERROR] Unable to connect to database', e2.message, e2.stack);
                        // Fix redirect here
                        res.render('browse', pageData);
                    });
            })
            .catch(e => {
                console.error('[ERROR] Unable to connect to database', e.message, e.stack);
                // Fix redirect here
                res.render('browse', pageData);
            });
    });
};
