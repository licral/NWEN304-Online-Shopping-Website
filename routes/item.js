/**
 * Created by liaobonn on 27/05/17.
 */
module.exports = function(app, pool){

    app.get('/item/:id', function(req, res) {
        var id = req.params.id;
        let pageData = {};

        pool.connect()
            .then(client => {
                // let sql = "select * from albums where id=" + id + ";";
                let sql = "select albums.id, albums.title, albums.description, albums.released_on, albums.genre, albums.image, albums.is_compilation, albums.price, artists.artist_name from albums inner join artists on albums.artist_id=artists.id where albums.id=" + id + ";";

                client.query(sql)
                    .then(result => {
                        client.release();
                        pageData.title = result.rows[0].title;
                        pageData.description = result.rows[0].description;
                        pageData.item = result.rows[0];
                        res.render('item', pageData);

                        console.log(`[Log] Sending all ${result.rowCount} albums to the client`);
                    })
                    .catch(e => {
                        client.release();
                        pageData.error = "Database error occurred, please refresh or contact hectorcaesar@hotmail.com.";
                        res.render('item', pageData);
                        console.error('[ERROR] Query error', e.message, e.stack);
                    });
            })
            .catch(error => {
                pageData.error = "Database unavailable, please try again.";
                res.render('item', pageData);
                console.error('[ERROR] Unable to connect to database', error.message, error.stack);
            });
    });

    app.get('/item/image/:id', function(req, res){
        var id = req.params.id;
        let pageData = {};

        pool.connect()
            .then(client => {
                let sql = "select * from albums where id=" + id + ";";

                client.query(sql)
                    .then(result => {
                        client.release();
                        var buffer = new Buffer(result.rows[0].test_image, "base64");
                        res.writeHead(200, {'Content-Type' : 'image/jpg'});
                        res.end(buffer, 'binary');

                        console.log(`[Log] Sending all ${result.rowCount} albums to the client`);
                    })
                    .catch(e => {
                        client.release();
                        console.error('[ERROR] Query error', e.message, e.stack);
                    });
            })
            .catch(error => {
                console.error('[ERROR] Unable to connect to database', error.message, error.stack);
            });
    });
}