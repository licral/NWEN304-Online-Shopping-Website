/**
 * Created by liaobonn on 12/06/17.
 */
module.exports = function (app, pool) {

    app.get('/manage/vinyls', isAdmin, function (request, response) {

        let pageData = {
            title: 'Manage All Vinyls',
            heading: 'Vinyls',
            description: "Manage all vinyls in the database"
        };

        // pass in flash messages
        let flash = request.flash();
        Object.keys(flash).forEach(key => {
            pageData[key] = flash[key];
        });

        let sql = "select a.id, a.title, a.price, b.artist_name from albums a join artists b on a.artist_id=b.id order by a.id;";

        pool.query(sql)
            .then(result => {
                pageData.albums = result.rows;
                response.set({
                    'Cache-Control': 'public, no-cache, must-revalidate'
                }).render('manage_list', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                pageData.error = "There was a problem with the database";
                response.render('manage_list', pageData);
            });
    });

    app.get('/manage/vinyl/:id', isAdmin, function (request, response) {
        var id = request.params.id;
        let pageData = {
            error: request.flash('error')
        };

        let sql = "select * from albums where id=" + id + ";";

        pool.query(sql)
            .then(result => {
                pageData.title = result.rows[0].title;
                pageData.description = result.rows[0].description;
                pageData.item = result.rows[0];
                var date = new Date(result.rows[0].released_on);
                var month = (date.getMonth() + 1) + "";
                if (month.length == 1) {
                    month = "0" + month;
                }
                var day = date.getDate() + "";
                if (day.length == 1) {
                    day = "0" + day;
                }
                pageData.item.released_on = date.getFullYear() + "-" + month + "-" + day;

                pool.query("select id, artist_name from artists;")
                    .then(result2 => {
                        pageData.artists = result2.rows;
                        response.render('manage_vinyl', pageData);
                    })
                    .catch(e => {
                        console.error('[ERROR] Query error', e.message, e.stack);
                        request.flash('error', 'Sorry we could not find the album');
                        response.redirect('/manage/vinyls');
                    });

            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                request.flash('error', 'Sorry we could not find the album');
                response.redirect('/manage/vinyls');
            });
    });

    app.post('/manage/vinyl/:id', isAdmin, function (request, response) {
        var data = request.body;
        var error = validateAlbumInput(data, request.file);
        if(error){
            request.flash('error', error);
            response.redirect('/manage/vinyl/' + request.params.id);
            return;
        }
        var id = request.params.id;
        var title = request.body.title;
        var artist = request.body.artist;
        var description = request.body.description;
        var is_compilation;
        if (request.body.is_compilation === "") {
            is_compilation = true;
        } else {
            is_compilation = false;
        }
        var released_on = request.body.released_on;
        var genre = request.body.genre;
        var price = request.body.price;

        let sql = "update albums set title=$1, artist_id=$2, description=$3, is_compilation=$4, released_on=$5, genre=$6, price=$7 where id=$8;";
        pool.query(sql, [title, artist, description, is_compilation, released_on, genre, price, id])
            .then(result => {
                if (request.file === undefined) {
                    request.flash('message', 'Album has been successfully editted');
                    response.redirect('/manage/vinyls');
                } else {
                    var album_image = request.file.buffer.toString('base64');
                    sql = "update album_images set image=$1 where album_id=$2;";
                    pool.query(sql, [album_image, id])
                        .then(result2 => {
                            request.flash('message', 'Album has been successfully editted');
                            response.redirect('/manage/vinyls');
                        })
                        .catch(e => {
                            console.error('[ERROR] Query error', e.message, e.stack);
                            request.flash('error', 'Sorry image could not be saved');
                            response.redirect('/manage/vinyls');
                        });
                }
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                request.flash('error', 'Sorry album could not be editted');
                response.redirect('/manage/vinyls');
            });
    });


    app.get('/manage/artists', isAdmin, function (request, response) {
        let pageData = {
            title: 'Manage All Artists',
            heading: 'Artists',
            description: "Manage all artists in the database"
        };

        // pass in flash messages
        let flash = request.flash();
        Object.keys(flash).forEach(key => {
            pageData[key] = flash[key];
        });

        let sql = "select id, artist_name from artists order by id;";

        pool.query(sql)
            .then(result => {
                pageData.artists = result.rows;
                response.set({
                    'Cache-Control': 'public, no-cache, must-revalidate'
                }).render('manage_list', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                pageData.error = "There was a problem with the database";
                response.render('manage_list', pageData);
            });
    });

    app.get('/manage/artist/:id', isAdmin, function (request, response) {
        var id = request.params.id;
        let pageData = {
            error: request.flash('error')
        };

        let sql = "select * from artists where id=$1;";

        pool.query(sql, [id])
            .then(result => {
                pageData.title = result.rows[0].artist_name;
                pageData.description = "Viewing information of artist " + result.rows[0].artist_name;
                pageData.item = result.rows[0];

                response.render('manage_artist', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                request.flash('error', 'Sorry we could not find the artist');
                response.redirect('/manage/artists');
            });
    });

    app.post('/manage/artist/:id', isAdmin, function (request, response) {
        var data = request.body;
        var error = validateArtistInput(data, request.file);
        if(error){
            request.flash('error', error);
            response.redirect('/manage/artist/' + request.params.id);
            return;
        }
        var id = request.params.id;
        var artist_name = request.body.artist_name;
        var description = request.body.description;

        let sql = "update artists set artist_name=$1, description=$2 where id=$3;";
        pool.query(sql, [artist_name, description, id])
            .then(result => {
                if (request.file === undefined) {
                    request.flash('message', 'Artist has been successfully editted');
                    response.redirect('/manage/artists');
                } else {
                    var album_image = request.file.buffer.toString('base64');
                    sql = "update artist_images set image=$1 where artist_id=$2;";
                    pool.query(sql, [album_image, id])
                        .then(result2 => {
                            request.flash('message', 'Artist has been successfully editted');
                            response.redirect('/manage/artists');
                        })
                        .catch(e => {
                            console.error('[ERROR] Query error', e.message, e.stack);
                            request.flash('error', 'Sorry image could not be saved');
                            response.redirect('/manage/artists');
                        });
                }
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                request.flash('error', 'Sorry artist could not be editted');
                response.redirect('/manage/artists');
            });
    });


    app.get('/manage/orders', isAdmin, function (request, response) {
        let pageData = {
            title: 'Manage All Orders',
            heading: 'Orders',
            description: "Manage all order histories in the database"
        };

        // pass in flash messages
        let flash = request.flash();
        Object.keys(flash).forEach(key => {
            pageData[key] = flash[key];
        });

        let sql = "SELECT orders.id, orders.order_time, users.displayname FROM orders JOIN users ON orders.user_id = users.id ORDER BY orders.id";

        pool.query(sql)
            .then(result => {
                pageData.orders = result.rows.map(order => {
                    let timeStamp = new Date(order.order_time);
                    let hour = timeStamp.getUTCHours();
                    let minute = timeStamp.getMinutes();
                    let day = timeStamp.getDate();
                    let month = timeStamp.getMonth() + 1;
                    let year = timeStamp.getFullYear();

                    day = day < 10 ? '0' + day : day;
                    month = month < 10 ? '0' + month : month;

                    let end = hour >= 12 ? "PM" : "AM";
                    hour = hour > 12 ? hour - 12 : hour;
                    hour = hour < 10 ? '0' + hour : hour;
                    minute = minute < 10 ? '0' + minute : minute;

                    return {
                        id: order.id,
                        order_date: `${day}/${month}/${year}`,
                        order_time: `${hour}:${minute} ${end}`,
                        user: order.displayname
                    };
                });

                response.set({
                    'Cache-Control': 'public, no-cache, must-revalidate'
                }).render('manage_list', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                pageData.error = "There was a problem with the database";
                response.render('manage_list', pageData);
            });
    });

    app.get('/manage/order/:id', isAdmin, function (request, response) {
        var id = request.params.id;
        let pageData = {};

        let sql = "SELECT orders.id AS order_id, users.username, orders.order_time, order_details.album_id, albums.title, order_details.quantity, order_details.price, order_details.id AS item_id FROM orders INNER JOIN order_details ON orders.id = order_details.order_id INNER JOIN albums ON order_details.album_id = albums.id INNER JOIN users ON orders.user_id = users.id WHERE orders.id = $1;";

        pool.query(sql, [id])
            .then(result => {
                let order = result.rows[0];

                let timeStamp = new Date(order.order_time);
                let hour = timeStamp.getUTCHours();
                let minute = timeStamp.getMinutes();
                let day = timeStamp.getDate();
                let month = timeStamp.getMonth() + 1;
                let year = timeStamp.getFullYear();

                day = day < 10 ? '0' + day : day;
                month = month < 10 ? '0' + month : month;

                let end = hour >= 12 ? "PM" : "AM";
                hour = hour > 12 ? hour - 12 : hour;
                hour = hour < 10 ? '0' + hour : hour;
                minute = minute < 10 ? '0' + minute : minute;

                pageData.order_time = `${hour}:${minute} ${end}`;
                pageData.order_date = `${day}/${month}/${year}`;

                pageData.title = "Order #" + order.order_id;
                pageData.description = "Viewing information of order # " + order.order_id;
                pageData.order_id = order.order_id;
                pageData.user = order.username;
                pageData.albums = result.rows;

                let totalPrice = pageData.albums.reduce((sum, album) => {
                    return sum + album.quantity * Number(album.price);
                }, 0);
                pageData.totalPrice = Number(totalPrice).toFixed(2);

                response.render('manage_order', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                request.flash('error', 'Sorry we could not find the order');
                response.redirect('/manage/orders');
            });
    });

    app.delete('/manage/remove/item/:id', isAdmin, function (request, response) {
        var id = request.params.id;
        let order_id;

        let sql1 = "SELECT order_id FROM order_details WHERE id = $1";
        let sql2 = "DELETE FROM order_details WHERE id = $1";
        let sql3 = "SELECT id FROM order_details WHERE order_id = $1";

        pool.query(sql1, [id]).then(result => {
            order_id = result.rows[0].order_id;
            return pool.query(sql2, [id]);
        }).then(result => {
            return pool.query(sql3, [order_id]);
        }).then(result => {
            if (result.rowCount === 0) {
                // we need to delete the corresponding order as well
                let sql4 = "DELETE FROM orders WHERE id = $1";
                return pool.query(sql4, [order_id]);
            }
        }).then(result => {
            if (result === undefined) {
                response.sendStatus(200);
            } else {
                // a workaround to make ajax respond to redirect
                response.status(200).json({redirect: '/manage/orders'});
            }
        }).catch(e => {
            console.error('[ERROR] Query error', e.message, e.stack);
            // Fix redirects here
            response.sendStatus(400);
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
}

function validateArtistInput(data, file){
    if(data.artist_name == '' || data.artist_name === undefined){
        return 'Artist name must not be empty';
    }
}
