module.exports = function (app, pool) {
    app.post('/search', function (request, response) {
        let keyword = request.body.keyword;

        let pageData = {
            title: 'Search Result',
            description: "Search Result",
            results: {
                albums: [],
                artists: []
            }
        };

        let sqls = [
            "SELECT * FROM albums WHERE LOWER(title) LIKE $1",
            "SELECT * FROM artists WHERE LOWER(artist_name) LIKE $1"
        ];

        Promise.all(sqls.map(sql => {
            return pool.query(sql, ['%' + keyword + '%']);
        })).then(arrayOfResult => {
            pageData.results.albums.push(...arrayOfResult[0].rows);
            pageData.results.artists.push(...arrayOfResult[1].rows);

            response.set({
                'Cache-Control': 'public, no-cache, must-revalidate'
            }).render('search_results', pageData);
        }).catch(error => {
            pageData.error = "Database error occurred";
            response.render('search_results', pageData);
            console.error('[ERROR] Query error:', error.message, error.stack);
        });
    });
};
