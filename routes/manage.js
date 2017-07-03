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

        // pass in flash messages
        let flash = req.flash();
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

                res.render('manage_order', pageData);
            })
            .catch(e => {
                console.error('[ERROR] Query error', e.message, e.stack);
                // Fix redirects here
                res.redirect('/manage/orders');
            });
    });

    app.post('/manage/remove/item/:id', isAdmin, function (req, res) {
        var id = req.params.id;
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
                res.sendStatus(200);
            } else {
                // a workaround to make ajax respond to redirect
                res.status(200).json({ redirect: '/manage/orders' });
            }
        }).catch(e => {
            console.error('[ERROR] Query error', e.message, e.stack);
            // Fix redirects here
            res.sendStatus(400);
        });
    });

    app.post("/archive", function (request, response) {
        // request.body example: { '16': 'on', '17': 'on', '18': 'on' }
        let arrayOfIds = Object.keys(request.body);

        if (arrayOfIds.length > 0) {
            let archiver = require("../services/order_archiver");
            let path = require('path');
            let fileName = new Date().toISOString().replace(/:/g, "").split(".")[0] + '.json';
            let filePath = path.join(__dirname, '../archives/orders/');
            let fullPath = filePath + fileName;

            archiver.archiveOrders(pool, arrayOfIds, fullPath, function (error) {
                if (error) {
                    console.error('[ERROR] Query error', error.message, error.stack);
                    request.flash('archiving_error', 'Archiving failed, please examine orders with id: ' + arrayOfIds);
                    response.redirect('/manage/orders');
                } else {
                    request.flash('archiving_done', 'Archiving done. File location: ' + fullPath);
                    response.redirect('/manage/orders');
                }
            });
        } else {
            request.flash('archiving_error', 'Please at lease select one order to archive');
            response.redirect('/manage/orders');
        }
    });
};

function isAdmin(req, res, next) {

    if(req.user){
        // if user is authenticated in the session, carry on
        if (req.user.is_admin){
            return next();
        } else {
            // if they aren't redirect them to the home page
            req.session.error = "Sorry you do not have permissions to access this content.";
            res.redirect('/');
        }
    } else {
        req.session.error = "You must be logged in to access this content.";
        res.redirect('/login');
    }

}
