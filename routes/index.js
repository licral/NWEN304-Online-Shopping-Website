/**
 * Created by liaobonn on 18/05/17.
 *
 * Route used to handle the home url
 */
module.exports = function(app, pool){
    app.get('/', function (req, res) {
        let pageData = {
            title: 'Home',
            description: "Welcome to Vinylholics! Find those classic vinyls you have always been looking for and maybe stumble on a great deal for it!"
        };

        let sql = "select a.id, a.title, a.price, b.artist_name from albums a join artists b on a.artist_id=b.id order by a.id desc limit 10;";

        pool.query(sql)
            .then(result => {
                pageData.albums = result.rows;
                res.set({
                    'Cache-Control': 'public, no-cache, must-revalidate'
                }).render('index', pageData);
            })
            .catch(error => {
                console.error('[ERROR] Unable to connect to database', error.message, error.stack);
                // Fix redirect here
                res.render('index', pageData);
            });
    });
};
