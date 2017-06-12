/**
 * Created by Bonnie on 27/05/2017.
 */
module.exports = function (app, pool) {
    app.get('/upload', function (req, res) {
        res.render('upload', {
            title: 'Upload a Record',
            description: "Upload a new record to sell"
        });
    });

    app.post('/upload-album-image/:id', function (request, response) {
        let pageData = {
            title: 'Upload a Record',
            description: "Upload a new record to sell",
        };

        let album_id = request.params.id;
        let album_image = request.file.buffer.toString('base64');
        let sql = "insert into album_images (image, album_id) values ($1, $2);";

        pool.query(sql, [album_image, album_id])
            .then(result => {
                response.render('upload', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                pageData.error = "Database error occurred";
                response.render('upload', pageData);
            });
    });

    app.post('/upload-artist-image', function (request, response) {
        let pageData = {
            title: 'Upload a Record',
            description: "Upload a new record to sell",
        };

        let artist_id = request.body.id;
        let artist_image = request.file.buffer.toString('base64');
        let sql = "insert into artist_images (image, artist_id) values ($1, $2);";

        pool.query(sql, [artist_image, artist_id])
            .then(result => {
                response.render('upload', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                pageData.error = "Database error occurred";
                response.render('upload', pageData);
            });
    });

    app.post('/upload/update/:id', function (request, response) {
        let album_id = request.params.id;
        let album_image = request.file.buffer.toString('base64');
        let sql = "update album_images set image=$1 where album_id=$2;";

        pool.query(sql, [album_image, album_id])
            .then(result => {
                // Fix redirect here
                response.redirect('/manage/vinyls');
            })
            .catch(e => {
                // Fix redirect here
                console.error('[ERROR] Query error', e.message, e.stack);
                response.redirect('/manage/vinyls');
            });
    });
};
