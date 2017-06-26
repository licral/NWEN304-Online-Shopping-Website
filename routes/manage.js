/**
 * Created by liaobonn on 12/06/17.
 */
module.exports = function (app, pool) {

    app.get('/manage/vinyls', isAdmin, function (req, res) {

        let pageData = {
            title: 'Manage All Vinyls',
            heading: 'Vinyls',
            description: "Manage all vinyls in the database"
        };

        let sql = "select a.id, a.title, a.price, b.artist_name from albums a join artists b on a.artist_id=b.id order by a.id;";

        pool.query(sql)
            .then(result => {
                pageData.albums = result.rows;
                res.render('manage_list', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                // Fix redirects here
                res.redirect('/');
            });
    });

    app.get('/manage/vinyl/:id', isAdmin, function (req, res) {
        var id = req.params.id;
        let pageData = {};

        let sql = "select * from albums where id=" + id + ";";

        pool.query(sql)
            .then(result => {
                pageData.title = result.rows[0].title;
                pageData.description = result.rows[0].description;
                pageData.item = result.rows[0];
                var date = new Date(result.rows[0].released_on);
                var month = (date.getMonth() + 1) + "";
                if(month.length == 1){
                    month = "0" + month;
                }
                var day = date.getDate() + "";
                if(day.length == 1){
                    day = "0" + day;
                }
                pageData.item.released_on = date.getFullYear() + "-" + month + "-" + day;

                pool.query("select id, artist_name from artists;")
                    .then(result2 => {
                        pageData.artists = result2.rows;
                        res.render('manage_vinyl', pageData);
                    })
                    .catch(e => {
                        client.release();
                        console.error('[ERROR] Query error', e.message, e.stack);
                        // Fix redirects here
                        res.redirect('/manage/vinyls');
                    });

            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                // Fix redirects here
                res.redirect('/manage/vinyls');
            });
    });

    app.post('/manage/vinyl/:id', isAdmin, function (req, res) {
        var id = req.params.id;
        var title = req.body.title;
        var artist = req.body.artist;
        var description = req.body.description;
        var is_compilation;
        if(req.body.is_compilation === ""){
            is_compilation = true;
        } else {
            is_compilation = false;
        }
        var released_on = req.body.released_on;
        var genre = req.body.genre;
        var price = req.body.price;

        let sql = "update albums set title=$1, artist_id=$2, description=$3, is_compilation=$4, released_on=$5, genre=$6, price=$7 where id=$8;";
        pool.query(sql, [title, artist, description, is_compilation, released_on, genre, price, id])
            .then(result => {
                if(req.file === undefined){
                    // Fix redirects here
                    res.redirect('/manage/vinyls');
                } else {
                    var album_image = req.file.buffer.toString('base64');
                    sql = "update album_images set image=$1 where album_id=$2;";
                    pool.query(sql, [album_image, id])
                        .then(result2 => {
                            res.redirect('/manage/vinyls');
                        })
                        .catch(e => {
                            console.error('[ERROR] Query error', e.message, e.stack);
                            // Fix redirects here
                            res.redirect('/manage/vinyls');
                        });
                }
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                // Fix redirects here
                res.redirect('/manage/vinyls');
            });
    });


    app.get('/manage/artists', isAdmin, function (req, res) {

        let pageData = {
            title: 'Manage All Artists',
            heading: 'Artists',
            description: "Manage all artists in the database"
        };

        let sql = "select id, artist_name from artists order by id;";

        pool.query(sql)
            .then(result => {
                pageData.artists = result.rows;
                res.render('manage_list', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                // Fix redirects here
                res.redirect('/');
            });
    });

    app.get('/manage/artist/:id', isAdmin, function (req, res) {
        var id = req.params.id;
        let pageData = {};

        let sql = "select * from artists where id=$1;";

        pool.query(sql, [id])
            .then(result => {
                pageData.title = result.rows[0].artist_name;
                pageData.description = "Viewing information of artist " + result.rows[0].artist_name;
                pageData.item = result.rows[0];

                res.render('manage_artist', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                // Fix redirects here
                res.redirect('/manage/artists');
            });
    });

    app.post('/manage/artist/:id', isAdmin, function (req, res) {
        var id = req.params.id;
        var artist_name = req.body.artist_name;
        var description = req.body.description;

        let sql = "update artists set artist_name=$1, description=$2 where id=$3;";
        pool.query(sql, [artist_name, description, id])
            .then(result => {
                if(req.file === undefined){
                    // Fix redirects here
                    res.redirect('/manage/artists');
                } else {
                    var album_image = req.file.buffer.toString('base64');
                    sql = "update artist_images set image=$1 where artist_id=$2;";
                    pool.query(sql, [album_image, id])
                        .then(result2 => {
                            res.redirect('/manage/artists');
                        })
                        .catch(e => {
                            console.error('[ERROR] Query error', e.message, e.stack);
                            // Fix redirects here
                            res.redirect('/manage/artists');
                        });
                }
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                // Fix redirects here
                res.redirect('/manage/artists');
            });
    });


    app.get('/manage/orders', isAdmin, function (req, res) {
        let pageData = {
            title: 'Manage All Orders',
            heading: 'Orders',
            description: "Manage all order histories in the database"
        };

        let sql = "SELECT orders.id, orders.order_time, users.username FROM orders JOIN users ON orders.user_id=users.id order by orders.id";

        pool.query(sql)
            .then(result => {
                pageData.orders = result.rows;
                res.render('manage_list', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                // Fix redirects here
                res.redirect('/');
            });
    });

    app.get('/manage/order/:id', isAdmin, function (req, res) {
        var id = req.params.id;
        let pageData = {};

        let sql = "SELECT orders.id AS order_id, users.username, orders.order_time, order_details.album_id, albums.title, order_details.quantity, order_details.price, order_details.id AS item_id FROM orders INNER JOIN order_details ON orders.id = order_details.order_id INNER JOIN albums ON order_details.album_id = albums.id INNER JOIN users ON orders.user_id = users.id WHERE orders.id = $1;";

        pool.query(sql, [id])
            .then(result => {
                pageData.title = "Order #" + result.rows[0].order_id;
                pageData.description = "Viewing information of order # " + result.rows[0].order_id;
                pageData.order_id = result.rows[0].order_id;
                pageData.order_time = result.rows[0].order_time;
                pageData.user = result.rows[0].username;
                pageData.albums = result.rows;
                pageData.totalPrice = 0;
                pageData.albums.forEach(album => {
                    pageData.totalPrice = pageData.totalPrice + album.quantity * Number(album.price);
                });
                res.render('manage_order', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                // Fix redirects here
                res.redirect('/manage/orders');
            });
    });

    app.post('/manage/remove/item/:id', function (req, res) {
        var id = req.params.id;

        let sql = "delete from order_details where id=$1;";
        pool.query(sql, [id])
            .then(result => {
                res.sendStatus(200);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                // Fix redirects here
                res.sendStatus(400);
            });
    });
};

function isAdmin(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.user.is_admin)
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
