/**
 * Created by Bonnie on 27/05/2017.
 */
module.exports = function(app, pool){
    app.get('/upload', function (req, res) {
        res.render('upload', {
            title: 'Upload a Record',
            description: "Upload a new record to sell"
        });
    });

    app.post('/upload', function(req, res){
        console.log(req.file.buffer.toString('base64'));
        pool.connect()
            .then(client => {
                let sql = "insert into albums (title, is_compilation, price, test_image, artist_id) values ('Test album', false, 12, '" + req.file.buffer.toString('base64') + "', 1);";

                client.query(sql)
                    .then(result => {
                        client.release();
                        res.redirect('/');
                    })
                    .catch(e => {
                        client.release();
                        console.error('[ERROR] Query error', e.message, e.stack);
                        res.redirect('/');
                    });
            })
            .catch(error => {
                console.error('[ERROR] Unable to connect to database', error.message, error.stack);
            });
    });
}