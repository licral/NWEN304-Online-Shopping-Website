/**
 * Created by Butlerslad on 18/06/17.
 */

exports.update = function (data, connection, callback){
};

exports.getRow = function (data, connection, callback){
    connection.connect()
        .then((client, err) => {
            if (err) {
                client.release();
                return callback(err, 'Users Error');
            }

            var query = "SELECT * FROM users WHERE username = $1";

            client.query(query, data, function (err, result) {
                client.release();
                if (err) {
                    console.log(err);
                    return callback(err, 'Get User Error');
                }

                return callback(false, false, result);
            });
        });
};