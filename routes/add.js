/**
 * Created by liaobonn on 12/06/17.
 */
module.exports = function (app, pool) {

    app.post('/add/vinyl', isAdmin, function (request, response) {
        var data = request.body;
        var error = validateAlbumInput(data, request.file);
        if(error){
            request.flash('error', error);
            response.redirect('/add/vinyl');
            return;
        }
        var title = request.body.title;
        var artist = request.body.artist;
        var description = request.body.description;
        var is_compilation;
        if(request.body.is_compilation === ""){
            is_compilation = true;
        } else {
            is_compilation = false;
        }
        var released_on = request.body.released_on;
        var genre = request.body.genre;
        var price = request.body.price;
        var album_image = request.file.buffer.toString('base64');

        let sql = "insert into albums (title, description, is_compilation, released_on, genre, price, artist_id) values ($1, $2, $3, $4, $5, $6, $7);";
        pool.query(sql, [title, description, is_compilation, released_on, genre, price, artist])
            .then(result => {
                // Fix redirects here
                sql = "select last_value from albums_id_seq;";
                pool.query(sql)
                    .then(result2 => {
                        var album_id = result2.rows[0].last_value;
                        sql = "insert into album_images (image, album_id) values ($1, $2);";
                        pool.query(sql, [album_image, album_id])
                            .then(result => {
                                request.flash('message', "The album has been successfully added.");
                                response.redirect('/manage/vinyls');
                            })
                            .catch(e => {
                                console.error('[ERROR] Query error', e.message, e.stack);
                                request.flash('error', "Sorry the image was not saved, please try again. If this doesn't work");
                                response.redirect('/manage/vinyls');
                            });
                    })
                    .catch(e2 => {
                        console.error('[ERROR] Query error', e2.message, e2.stack);
                        request.flash('error', "Sorry the image was not saved, please try again. If this doesn't work");
                        response.redirect('/manage/vinyls');
                    });
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                request.flash('error', "Sorry the album could not be saved, please try again. If this doesn't work");
                response.redirect('/manage/vinyls');
            });
    });

    app.get('/add/vinyl', isAdmin, function (request, response) {
        let pageData = {
            title : "Add New Vinyl",
            description : "Add a new vinyl record",
            error: request.flash('error')
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

                response.set({
                    'Cache-Control': 'public, no-cache, must-revalidate',
                    'Expires': new Date(Date.now() + 86400000).toUTCString()
                }).render('new_vinyl', pageData);
            })
            .catch(e => {
                pageData.error = "Database error occurred, please refresh or contact hectorcaesar@hotmail.com.";
                response.render('new_vinyl', pageData);
                console.error('[ERROR] Query error', e.message, e.stack);
            });
    });


    app.post('/add/artist', isAdmin, function (request, response) {
        var data = request.body;
        var error = validateArtistInput(data, request.file);
        if(error){
            request.flash('error', error);
            response.redirect('/add/artist');
            return;
        }
        var artist_name = request.body.artist_name;
        var description = request.body.description;
        var image = request.file.buffer.toString('base64');

        let sql = "insert into artists (artist_name, description) values($1, $2);";
        pool.query(sql, [artist_name, description])
            .then(result => {
                // Fix redirects here
                sql = "select last_value from artists_id_seq;";
                pool.query(sql)
                    .then(result2 => {
                        var artist_id = result2.rows[0].last_value;
                        sql = "insert into artist_images (image, artist_id) values ($1, $2);";
                        pool.query(sql, [image, artist_id])
                            .then(result => {
                                request.flash('message', "The artist has been successfully added.");
                                response.redirect('/manage/artists');
                            })
                            .catch(e => {
                                console.error('[ERROR] Query error', e.message, e.stack);
                                request.flash('error', "Sorry the image could not be saved, please try again. If this doesn't work");
                                response.redirect('/manage/artists');
                            });
                    })
                    .catch(e2 => {
                        console.error('[ERROR] Query error', e2.message, e2.stack);
                        request.flash('error', "Sorry the image could not be saved, please try again. If this doesn't work");
                        response.redirect('/manage/artists');
                    });
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                request.flash('error', "Sorry the artist could not be saved, please try again. If this doesn't work");
                response.redirect('/manage/artists');
            });
    });

    app.get('/add/artist', isAdmin, function (request, response) {
        response.set({
            'Cache-Control': 'public, no-cache, must-revalidate',
            'Expires': new Date(Date.now() + 86400000).toUTCString()
        }).render('new_artist', {
            title : "Add New Artist",
            description : "Add a new artist",
            error: request.flash('error')
        });
    });
};

function isAdmin(request, response, next) {
    if (request.user) {
        // if user is authenticated in the session, carry on
        if (request.user.is_admin) {
            return next();
        } else {
            // if they aren't redirect them to the home page
            request.flash('error', 'Sorry you do not have permissions to access this content');
            response.redirect('/');
        }
    } else {
        request.flash('error', 'You must be logged in to access this content');
        response.redirect('/login');
    }
}

function validateAlbumInput(data, file){
    if(data.title == '' || data.title === undefined){
        return 'Title must not be empty';
    }
    if(data.artist == '' || data.artist === undefined){
        return 'Artist must not be empty';
    }
    if(data.released_on == '' || data.released_on === undefined){
        return 'Released On must not be empty';
    } else if (new Date(data.released_on) === "Invalid Date") {
        return 'Released On must be a valid date';
    }
    if(data.price == '' || data.price === undefined){
        return 'Price must not be empty';
    } else if (isNaN(data.price) || data.price <= 0) {
        return 'Price must be a valid number';
    }
    if(file == '' || file === undefined || file.buffer == '' || file.buffer === undefined){
        return 'Image must not be empty';
    }
}

function validateArtistInput(data, file){
    if(data.artist_name == '' || data.artist_name === undefined){
        return 'Artist name must not be empty';
    }
    if(file == '' || file === undefined || file.buffer == '' || file.buffer === undefined){
        return 'Image must not be empty';
    }
}