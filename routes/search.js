module.exports = function (app, pool) {
    "use strict";

    app.post('/search', function (request, respond) {
        let pageData = {
            title: 'Search Result',
            description: "Browse all vinyl records",
            results: {
                albums: [],
                artists: [],
                songs: []
            }
        };

        let sqls = [
            "SELECT * FRooOM albums WHERE title = $1",
            "SELECT * FROM artists WHERE artist_name = $1",
            "SELECT * FROM songs WHERE title = $1"
        ];

        Promise.all(sqls.map(sql => {
            return pool.query(sql, [request.body.keyword]);
        })).then((arrayOfResult) => {
            pageData.results.albums.push(...arrayOfResult[0].rows);
            pageData.results.artists.push(...arrayOfResult[1].rows);
            pageData.results.songs.push(...arrayOfResult[2].rows);

            respond.render('search_results', pageData);
        }).catch(error => {
            pageData.error = "Database error occurred";
            respond.render('search_results', pageData);
            console.error('[ERROR] Query error', error.message, error.stack);
        });
    });
};
