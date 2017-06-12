/**
 * Created by liaobonn on 12/06/17.
 */
module.exports = function (app, pool) {

    app.get('/manage/vinyls', function (req, res) {

        let pageData = {
            title: 'Manage All Vinyls',
            heading: 'Vinyls',
            description: "Manage all vinyls in the database"
        };

        pool.connect()
            .then(client => {
                let sql = "select a.id, a.title, a.price, b.artist_name from albums a join artists b on a.artist_id=b.id;";

                client.query(sql)
                    .then(result => {
                        client.release();
                        pageData.albums = result.rows;
                        res.render('manage_list', pageData);

                        console.log(`[Log] Sending all ${result.rowCount} albums to the client`);
                    })
                    .catch(e => {
                        client.release();
                        pageData.error = "Database error occurred, please refresh or contact hectorcaesar@hotmail.com.";
                        res.render('manage_list', pageData);
                        console.error('[ERROR] Query error', e.message, e.stack);
                    });
            })
            .catch(error => {
                pageData.error = "Database unavailable, please try again.";
                res.render('manage_list', pageData);
                console.error('[ERROR] Unable to connect to database', error.message, error.stack);
            });
    });

    app.get('/manage/vinyl/:id', function (req, res) {
        var id = req.params.id;
        let pageData = {};

        pool.connect()
            .then(client => {
                let sql = "select * from albums where id=" + id + ";";

                client.query(sql)
                    .then(result => {
                        pageData.title = result.rows[0].title;
                        pageData.description = result.rows[0].description;
                        pageData.item = result.rows[0];

                        client.query("select id, artist_name from artists;")
                            .then(result2 => {
                                client.release();
                                pageData.artists = result2.rows;

                                res.render('manage_vinyl', pageData);
                            })
                            .catch(e => {
                                client.release();
                                pageData.error = "Database error occurred, please refresh or contact hectorcaesar@hotmail.com.";
                                res.render('manage_vinyl', pageData);
                                console.error('[ERROR] Query error', e.message, e.stack);
                            });

                        console.log(`[Log] Sending all ${result.rowCount} albums to the client`);
                    })
                    .catch(e => {
                        client.release();
                        pageData.error = "Database error occurred, please refresh or contact hectorcaesar@hotmail.com.";
                        res.render('manage_vinyl', pageData);
                        console.error('[ERROR] Query error', e.message, e.stack);
                    });
            })
            .catch(error => {
                pageData.error = "Database unavailable, please try again.";
                res.render('manage_vinyl', pageData);
                console.error('[ERROR] Unable to connect to database', error.message, error.stack);
            });
    });

    app.post('/manage/vinyl/:id', function (req, res) {
        var id = req.params.id;
        var title = req.body.title;
        var artist = req.body.artist;
        var description = req.body.description;
        var released_on = req.body.released_on;
        var genre = req.body.genre;
        var price = req.body.price;

        let sql = "update albums set title=$1, artist_id=$2, description=$3, released_on=$4, genre=$5, price=$6 where id=$7;";
        pool.query(sql, [title, artist, description, released_on, genre, price, id])
            .then(result => {
                res.redirect('/manage/vinyls');
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                res.redirect('/manage/vinyls');
            });

    });


    app.get('/manage/orders', function (req, res) {
        res.render('manage_list', {
            title: 'Manage All Orders',
            heading: 'Orders',
            description: "Manage all order histories in the database"
        });
    });

    // app.post('/upload-artist-image', function (request, response) {
    //     let pageData = {
    //         title: 'Upload a Record',
    //         description: "Upload a new record to sell",
    //     };
    //
    //     let artist_id = request.body.id;
    //     let artist_image = request.file.buffer.toString('base64');
    //     let sql = "insert into artist_images (image, artist_id) values ($1, $2);";
    //
    //     pool.query(sql, [artist_image, artist_id])
    //         .then(result => {
    //             response.render('upload', pageData);
    //         })
    //         .catch(e => {
    //             console.error('[ERROR] Query error', e.message, e.stack);
    //             pageData.error = "Database error occurred";
    //             response.render('upload', pageData);
    //         });
    // });
};
