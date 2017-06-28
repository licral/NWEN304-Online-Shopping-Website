module.exports = function (app, pool) {

    app.get('/artist/:id', function (request, response) {
        let id = request.params.id;
        let pageData = {};

        let sqls = [
            "SELECT id, artist_name, description FROM artists WHERE id = $1",
            "SELECT id, title FROM albums WHERE artist_id = $1"
        ];

        Promise.all(sqls.map(sql => {
            return pool.query(sql, [id]);
        })).then((arrayOfResult) => {
            let artist = arrayOfResult[0].rows[0];

            if (artist) {
                pageData.title = artist.artist_name;
                pageData.description = `Profile page about ${artist.artist_name}`;
                pageData.artist = artist;
            }

            if (arrayOfResult[1].rows[0]) {
                pageData.albums = arrayOfResult[1].rows;
            }

            response.set({
                'Cache-Control': 'public, max-age=86400',
                'Expires': new Date(Date.now() + 86400000).toUTCString()
            }).render('artist', pageData);
        }).catch(error => {
            pageData.title = "Error";
            pageData.description = "Error";
            pageData.error = "Database error occurred";

            response.render('artist', pageData);
            console.error('[ERROR] Query error', error.message, error.stack);
        });
    });
};
