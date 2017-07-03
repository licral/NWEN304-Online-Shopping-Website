module.exports = function (app, pool) {
    /**
     * Checkout. 4 steps:
     * 1. add an order / add an row in orders
     * 2. find out what's in shopping cart / retrieve all info in shopping_cart_details that the shopping_cart_id
     *    belongs to this user.
     * 3. add items in shopping cart into the new order created in step 1 / add rows containing info from step 2
     *    into the order_details where the order_id matches the new order created in step 1
     * 4. if step 3 succeeded then empty the shopping cart, else do nothing / delete all rows from shopping_cart_details that belongs to this user.
     */
    app.get('/checkout', function (request, response) {
        if (request.user) {
            let userId = request.user.id;
            let numAffectedRows;

            let sql1 = "INSERT INTO orders (user_id, order_time) VALUES ($1, now()) RETURNING id";
            let sql2 = "SELECT album_id, quantity, price FROM shopping_cart_details INNER JOIN albums ON shopping_cart_details.album_id = albums.id WHERE shopping_cart_id = (SELECT id FROM shopping_carts WHERE user_id = $1)";
            let sql3 = "INSERT INTO order_details (order_id, album_id, quantity, price) VALUES ";
            let sql4 = "DELETE FROM shopping_cart_details WHERE shopping_cart_id = (SELECT id FROM shopping_carts WHERE user_id = $1)";

            Promise.all([sql1, sql2].map(sql => {
                // 1. add an order / add an row in orders
                // 2. find out what's in shopping cart / retrieve all info in shopping_cart_details that the shopping_cart_id belongs to this user.
                return pool.query(sql, [userId]);
            })).then(arrayOfResult => {
                // 3. add items in shopping cart into the new order created in step 1 / add rows containing info from step 2 into the order_details where the order_id matches the new order created in step 1

                // arrayOfResult[0] is the order id
                let order_id = arrayOfResult[0].rows[0].id;
                let triples = [];

                // arrayOfResult[1] is an array of json {album_id: **, quantity: **, price: **}
                arrayOfResult[1].rows.forEach(triple => {
                    // aggregate results, if two rows has same album, then add quantity together;
                    let existingTriple = triples.find(element => element.album_id === triple.album_id);

                    if (existingTriple) {
                        existingTriple.quantity += triple.quantity;
                    } else {
                        triples.push(triple);
                    }
                });

                numAffectedRows = triples.length;

                let values = triples.map(triple => `(${order_id}, ${triple.album_id}, ${triple.quantity}, ${triple.price})`).join(", ");
                return pool.query(sql3 + values);
            }).then(result => {
                // 4. if step 3 succeeded then empty the shopping cart, else do nothing / delete all rows from shopping_cart_details that belongs to this user.
                if (result.rowCount === numAffectedRows) {  // success
                    let pageData = {
                        title: "Confirming your order",
                        description: "Confirming your order",
                    };

                    response.render("checkout", pageData);

                    pool.query(sql4, [userId]).catch(error => {
                        console.error(`[ERROR] Failed to empty the shopping cart for user ${userId}. error: ${error.message} ${error.stack}`);
                    });
                } else {
                    response.status(404).send("Cannot find item, please try again.");
                    console.error('[ERROR] check the result from query:');
                    console.error(result);
                }

            }).catch(error => {
                response.status(404).send("Cannot find item, please try again.");
                console.error('[ERROR] Query error:', error.message, error.stack);
            });
        } else {
            response.flash('error', 'You must be logged in to access this content');
            response.redirect("/login"); // if the user is not logged in, redirect. This shouldn't happen.
            console.error("[ERROR] Received GET '/checkout' without authenticated user.");
        }
    });

    // View order history
    app.get("/orders", function (request, response) {
        if (request.user) {
            let userId = request.user.id;
            let pageData = {
                title: 'Order History',
                description: "Review all your orders"
            };

            let sql = "SELECT orders.id AS order_id, orders.order_time, order_details.album_id, albums.title, order_details.quantity, order_details.price FROM orders INNER JOIN order_details ON orders.id = order_details.order_id INNER JOIN albums ON order_details.album_id = albums.id WHERE orders.user_id = $1";

            pool.query(sql, [userId])
                .then(result => {
                    // reorganise the result, make items in the same order grouped together
                    pageData.orders = result.rows.reduce((groupedResult, row) => {
                        let order = groupedResult.find(element => element.order_id === row.order_id);

                        if (order) {
                            order.albums.push({
                                id: row.album_id,
                                title: row.title,
                                quantity: row.quantity,
                                price: row.price
                            });
                        } else {
                            groupedResult.push({
                                order_id: row.order_id,
                                order_time: row.order_time,
                                albums: [{
                                    id: row.album_id,
                                    title: row.title,
                                    quantity: row.quantity,
                                    price: row.price
                                }]
                            });
                        }

                        return groupedResult;
                    }, []);

                    // calculate the total price
                    pageData.orders.forEach(order => {
                        order.totalPrice = order.albums.reduce((sum, album) => {
                            return sum + album.quantity * Number(album.price);
                        }, 0);
                    });

                    response.set({
                        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
                    }).render('orders', pageData);
                })
                .catch(error => {
                    pageData.error = "Database error occurred";
                    console.error(`[ERROR] Failed to retrieve order history for user ${userId}. error: ${error.message} ${error.stack}`);
                    response.render('orders', pageData);
                });
        } else {
            response.flash('error', 'You must be logged in to access this content');
            response.redirect("/login"); // if the user is not logged in, redirect. This shouldn't happen.
            console.error("[ERROR] Received GET '/orders' without authenticated user.");
        }
    });
};
