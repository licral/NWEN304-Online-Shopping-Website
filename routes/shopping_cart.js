module.exports = function (app, pool) {
    app.get('/shopping_cart', function (request, response) {
        if (request.user) {
            let userId = request.user.id;
            let sql = "SELECT shopping_cart_details.id, albums.id AS album_id, albums.title, quantity, albums.price FROM shopping_carts INNER JOIN shopping_cart_details ON shopping_carts.id = shopping_cart_details.shopping_cart_id INNER JOIN albums ON shopping_cart_details.album_id = albums.id WHERE shopping_carts.user_id = $1";

            pool.query(sql, [userId])
                .then(result => {
                    response.send(result.rows);
                })
                .catch(e => {
                    response.status(500).send("Database error occurred, items in cart may not be saved, please refresh or contact hectorcaesar@hotmail.com.");
                    console.error('[ERROR] Query error:', e.message, e.stack);
                });
        } else {
            response.send([]); // this shouldn't happen
        }
    });

    app.post('/shopping_cart', function (request, response) {
        if (request.user) {
            let userId = request.user.id;
            let albumId = request.body.albumId;
            let quantity = request.body.quantity;
            let sql = "INSERT INTO shopping_cart_details (shopping_cart_id, album_id, quantity) VALUES ((SELECT id FROM shopping_carts WHERE user_id = $1), $2, $3) RETURNING id";

            pool.query(sql, [userId, albumId, quantity])
                .then(result => {
                    if (result.rowCount === 1) {
                        let id = result.rows[0].id;
                        response.status(200).json({ id: id });
                    } else {
                        response.status(500).send("Invalid query, items in cart may not be saved, please refresh or contact hectorcaesar@hotmail.com.");
                        console.error('[ERROR] Insertion failed, check the result from query:');
                        console.error(result);
                    }
                })
                .catch(e => {
                    response.status(500).send("Database error occurred, items in cart may not be saved, please refresh or contact hectorcaesar@hotmail.com.");
                    console.error('[ERROR] Query error: ', e.message, e.stack);
                });
        } else {
            response.send([]); // this shouldn't happen
        }
    });

    app.delete('/shopping_cart/:id', function (request, response) {
        if (request.user) {
            let id = request.params.id;
            let sql = "DELETE FROM shopping_cart_details WHERE id = $1";

            pool.query(sql, [id])
                .then(result => {
                    if (result.rowCount === 1) {
                        response.sendStatus(200);
                    } else {
                        response.status(404).send("Cannot find item, please try again.");
                        console.error('[ERROR] Deletion failed, check the result from query:');
                        console.error(result);
                    }
                })
                .catch(e => {
                    response.status(500).send("Database error occurred, items in cart may not be saved, please refresh or contact hectorcaesar@hotmail.com.");
                    console.error('[ERROR] Query error: ', e.message, e.stack);
                });
        } else {
            response.send([]); // this shouldn't happen
        }
    });

    app.patch('/shopping_cart/:id', function (request, response) {
        if (request.user) {
            let id = request.params.id;
            let newQuantity = request.body.quantity;
            let sql = "UPDATE shopping_cart_details SET quantity = $1 WHERE id = $2";

            pool.query(sql, [newQuantity, id])
                .then(result => {
                    if (result.rowCount === 1) {
                        response.sendStatus(200);
                    } else {
                        response.status(404).send("Cannot find item, please try again.");
                        console.error('[ERROR] Update failed, check the result from query:');
                        console.error(result);
                    }
                })
                .catch(e => {
                    response.status(500).send("Database error occurred, items in cart may not be saved, please refresh or contact hectorcaesar@hotmail.com.");
                    console.error('[ERROR] Query error: ', e.message, e.stack);
                });
        } else {
            response.send([]); // this shouldn't happen
        }
    });
};
