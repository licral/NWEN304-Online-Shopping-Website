module.exports = function (app, pool) {
    "use strict";

    app.post('/search', function (request, response) {
        let pageData = {
            title: 'Search Result',
            description: "Search Result",
            results: {
                albums: [],
                artists: [],
                songs: []
            }
        };

        let sqls = [
            "SELECT * FROM albums WHERE LOWER(title) = LOWER($1)",
            "SELECT * FROM artists WHERE LOWER(artist_name) = LOWER($1)",
            "SELECT * FROM songs WHERE LOWER(title) = LOWER($1)"
        ];

        Promise.all(sqls.map(sql => {
            return pool.query(sql, [request.body.keyword]);
        })).then((arrayOfResult) => {
            pageData.results.albums.push(...arrayOfResult[0].rows);
            pageData.results.artists.push(...arrayOfResult[1].rows);
            pageData.results.songs.push(...arrayOfResult[2].rows);

            response.render('search_results', pageData);
        }).catch(error => {
            pageData.error = "Database error occurred";
            response.render('search_results', pageData);
            console.error('[ERROR] Query error', error.message, error.stack);
        });
    });
};
