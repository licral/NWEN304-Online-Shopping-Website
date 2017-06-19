/**
 * Created by Butlerslad on 18/06/17.
 */

exports.update = function (data, connection, callback){
    connection.connect()
        .then((client, err) => {
            if (err) {
                client.release();
                return callback(err, 'Update Profile Error');
            }

            var query = "UPDATE user_details " +
                "SET first_name = $1, " +
                "last_name = $2, " +
                "contact_no = $3, " +
                "street = $4, " +
                "suburb = $5, " +
                "city = $6, " +
                "country = $7 " +
                "WHERE user_id = ($8)";

            client.query(query, data, function (err) {
                client.release();
                if (err) {
                    console.log(err);
                    return callback(err, 'Update Profile Error');
                }

                callback(false);
            });
        });
};

exports.getRow = function (data, connection, callback){
    connection.connect()
        .then((client, err) => {
            if (err) {
                client.release();
                return callback(err, 'Profile Error');
            }

            var query = "SELECT * FROM user_details WHERE user_id = $1";

            client.query(query, data, function (err, result) {
                client.release();
                if (err) {
                    console.log(err);
                    return callback(err, 'Get Profile Error');
                }

                if(!result.rows){
                    return callback(err, 'Profile Does Not Exist');
                }

                return callback(false, false, result.rows[0]);
            });
        });
};