module.exports = {

    /**
     * 1. query DB to get required information (which orders to archive)
     * 2. write those orders to json files
     * 3. delete related rows from order_details
     * 4. delete related rows from orders
     * 5. invoke callback function
     *
     * @param pgPool           pg connection pool
     * @param arrayOfIds       array of IDs that we want to delete
     * @param filePath         the location where the file is saved
     * @param callback         callback function
     */
    archiveOrders: function (pgPool, arrayOfIds, filePath, callback) {
        // retrieve all info that we need to archive
        let ids = arrayOfIds.join();
        let sqlRetrieve = `SELECT orders.id AS order_id, orders.user_id AS user_id, orders.order_time, order_details.album_id, order_details.quantity, order_details.price FROM orders INNER JOIN order_details ON orders.id = order_details.order_id WHERE order_id IN (${ids})`;

        pgPool.query(sqlRetrieve).then(result => {
            // 1. query DB to get required information (which orders to archive)
            let myData = buildJSON(result.rows);
            let json = JSON.stringify(myData, null, 2);

            return new Promise(function (resolve, reject) {
                let fs = require("fs");

                console.log("====================================");
                console.log(json);

                // 2. write those orders to json files
                fs.writeFile(filePath, json, err => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log("JSON saved to " + filePath);
                        resolve();
                    }
                });
            });
        }).then(result => {
            // 3. delete related rows from order_details
            return pgPool.query(`DELETE FROM order_details WHERE order_id IN (${ids})`);
        }).then(result => {
            // 4. delete related rows from orders
            return pgPool.query(`DELETE FROM orders WHERE id IN (${ids})`);
        }).then(result => {
            // 5. invoke callback function
            callback();
        }).catch(error => {
            callback(error);
        });
    },

    /**
     * Put data from archived json file back to DB
     *
     * @param pgPool
     * @param filePath
     */
    unarchiveOrders: function (pgPool, filePath) {
        // TODO: probably don't have time to do this. but would be fun.
    }
};

function buildJSON(arrayOfOrders) {
    let json = {orders: {}};

    json.orders = arrayOfOrders.reduce((groupedResult, row) => {
        if (!groupedResult.hasOwnProperty(row.order_id)) {
            groupedResult[row.order_id] = {
                user_id: row.user_id,
                order_time: row.order_time,
                albums: {}
            };
        }

        groupedResult[row.order_id].albums[row.album_id] = {
            quantity: row.quantity,
            price: row.price
        };

        return groupedResult;
    }, {});

    return json;
}
