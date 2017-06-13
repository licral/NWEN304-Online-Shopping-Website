/**
 * Created by liaobonn on 12/06/17.
 */
module.exports = function (app, pool) {

    app.post('/add/vinyl', function (req, res) {
        var title = req.body.title;
        var artist = req.body.artist;
        var description = req.body.description;
        var released_on = req.body.released_on;
        var genre = req.body.genre;
        var price = req.body.price;
        var album_image = request.file.buffer.toString('base64');

        let sql = "insert into albums (title, description, released_on, genre, is_compilation, price, artist_id) values ($1, $2, $3, $4, $5, $6, $7);";
        pool.query(sql, [title, description, released_on, genre])
            .then(result => {
                // Fix redirects here
                res.redirect('/manage/vinyls');
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

                res.render('new_vinyl', pageData);
            })
            .catch(e => {
                pageData.error = "Database error occurred, please refresh or contact hectorcaesar@hotmail.com.";
                res.render('new_vinyl', pageData);
                console.error('[ERROR] Query error', e.message, e.stack);
            });
    });
};
