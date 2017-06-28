/**
 * Created by liaobonn on 12/06/17.
 */
module.exports = function (app, pool) {

    app.post('/add/vinyl', function (req, res) {
        var title = req.body.title;
        var artist = req.body.artist;
        var description = req.body.description;
        var is_compilation;
        if(req.body.is_compilation === ""){
            is_compilation = true;
        } else {
            is_compilation = false;
        }
        var released_on = req.body.released_on;
        var genre = req.body.genre;
        var price = req.body.price;
        var album_image = req.file.buffer.toString('base64');

        let sql = "insert into albums (title, description, is_compilation, released_on, genre, price, artist_id) values ($1, $2, $3, $4, $5, $6, $7);";
        pool.query(sql, [title, description, is_compilation, released_on, genre, price, artist])
            .then(result => {
                // Fix redirects here
                sql = "select last_value from albums_id_seq;";
                pool.query(sql)
                    .then(result2 => {
                        var album_id = result2.rows[0].last_value;
                        sql = "insert into album_images (image, album_id) values ($1, $2);";
                        pool.query(sql, [album_image, album_id])
                            .then(result => {
                                res.redirect('/manage/vinyls');
                            })
                            .catch(e => {
                                console.error('[ERROR] Query error', e.message, e.stack);
                                // Fix redirects here
                                res.redirect('/manage/vinyls');
                            });
                    })
                    .catch(e2 => {
                        console.error('[ERROR] Query error', e2.message, e2.stack);
                        // Fix redirects here
                        res.redirect('/manage/vinyls');
                    });
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                // Fix redirects here
                res.redirect('/manage/vinyls');
            });
    });

    app.get('/add/vinyl', function (req, res) {
        let pageData = {
            title : "Add New Vinyl",
            description : "Add a new vinyl record"
        };
        let sql = "select id, artist_name from artists;";

        pool.query(sql)
            .then(result => {
                pageData.artists = result.rows;
                var date = new Date();
                var month = (date.getMonth() + 1) + "";
                if(month.length == 1){
                    month = "0" + month;
                }
                var day = date.getDate() + "";
                if(day.length == 1){
                    day = "0" + day;
                }
                pageData.date = date.getFullYear() + "-" + month + "-" + day;

                res.set({
                    'Cache-Control': 'public, max-age=86400',
                    'Expires': new Date(Date.now() + 86400000).toUTCString()
                }).render('new_vinyl', pageData);
            })
            .catch(e => {
                pageData.error = "Database error occurred, please refresh or contact hectorcaesar@hotmail.com.";
                res.render('new_vinyl', pageData);
                console.error('[ERROR] Query error', e.message, e.stack);
            });
    });


    app.post('/add/artist', function (req, res) {
        var artist_name = req.body.artist_name;
        var description = req.body.description;
        var image = req.file.buffer.toString('base64');

        let sql = "insert into artists (artist_name, description) values($1, $2);";
        pool.query(sql, [artist_name, description])
            .then(result => {
                // Fix redirects here
                sql = "select last_value from artists_id_seq;";
                pool.query(sql)
                    .then(result2 => {
                        var artist_id = result2.rows[0].last_value;
                        sql = "insert into artist_images (image, artist_id) values ($1, $2);";
                        pool.query(sql, [image, artist_id])
                            .then(result => {
                                res.redirect('/manage/artists');
                            })
                            .catch(e => {
                                console.error('[ERROR] Query error', e.message, e.stack);
                                // Fix redirects here
                                res.redirect('/manage/artists');
                            });
                    })
                    .catch(e2 => {
                        console.error('[ERROR] Query error', e2.message, e2.stack);
                        // Fix redirects here
                        res.redirect('/manage/artists');
                    });
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                // Fix redirects here
                res.redirect('/manage/artists');
            });
    });

    app.get('/add/artist', function (req, res) {
        res.set({
            'Cache-Control': 'public, max-age=86400',
            'Expires': new Date(Date.now() + 86400000).toUTCString()
        }).render('new_artist', {
            title : "Add New Artist",
            description : "Add a new artist"
        });
    });
};
