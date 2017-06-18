/**
 * Created by liaobonn on 27/05/17.
 */
module.exports = function (app, pool) {

    app.get('/item/:id', function (req, res) {
        let id = req.params.id;
        let pageData = {
            album: {},
            artist: {}
        };

        let sql = "SELECT albums.id AS album_id, albums.title, albums.description AS album_description, albums.released_on, albums.genre, albums.is_compilation, albums.price, artists.id AS artist_id, artists.artist_name, artists.description AS artist_description FROM albums INNER JOIN artists ON albums.artist_id = artists.id WHERE albums.id = $1";

        pool.query(sql, [id])
            .then(result => {
                let row = result.rows[0];

                pageData.title = row.title;
                pageData.description = "Details about" + row.title;

                pageData.album = {
                    id: row.album_id,
                    title: row.title,
                    description: row.album_description,
                    released_on: row.released_on,
                    genre: row.genre,
                    is_compilation: row.is_compilation,
                    price: row.price
                };

                pageData.artist = {
                    id: row.artist_id,
                    name: row.artist_name,
                    description: row.artist_description
                };

                res.render('item', pageData);
            })
            .catch(e => {
                pageData.error = "Database error occurred";
                res.render('search_results', pageData);
                console.error('[ERROR] Query error:', e.message, e.stack);
            });
    });
};
