module.exports = function (app, pool) {
    "use strict";

    app.post('/search', function (request, respond) {
        let renderData = {
            title: 'Browse All Vinyls',
            description: "Browse all vinyl records",
            results: {
                albums: [],
                artists: [],
                songs: [],
                advanceSearch: []
            }
        };

        let data = request.body;

        if (data.keyword) {  // search for keyword
            let keyword = data.keyword;

            let sqls = [
                "SELECT * FROM albums WHERE title = $1",
                "SELECT * FROM artists WHERE artist_name = $1",
                "SELECT * FROM songs WHERE title = $1"
            ];

            Promise.all(sqls.map(sql => {
                return pool.query(sql, [keyword]);
            })).then((arrayOfResult) => {
                renderData.results.albums.push(...arrayOfResult[0].rows);
                renderData.results.artists.push(...arrayOfResult[1].rows);
                renderData.results.songs.push(...arrayOfResult[2].rows);

                respond.render('search_results', renderData);
            });

        } else { // advanced search

            /*
             * TODO: need more logic for advanced search.
             *
             * for [artist, album, song]
             * if two or three of them are present, use joined tables
             * if only one present, search that table only
             *
             * also need a js script to check if at least one field has words in it.
             *
             */


            let sql = "SELECT * FROM albums INNER JOIN artists ON albums.artist_id = artists.id INNER JOIN songs ON songs.artist_id = artists.id WHERE artists.artist_name = $1 AND albums.title = $2 AND songs.title = $3";

            pool.query(sql, [data.artist, data.album, data.song]).then(result => {
                renderData.results.advanceSearch.push(...result.rows);
                respond.render('search_results', renderData);
            }).catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
            });
        }
    });
};
