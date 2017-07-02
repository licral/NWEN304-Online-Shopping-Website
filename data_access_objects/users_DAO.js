/**
 * Created by Butlerslad on 18/06/17.
 */

exports.update = function (data, connection, callback){
};

exports.getRow = function (data, connection, callback){
            var query = "SELECT * FROM users WHERE username = $1";

            connection.query(query, data, function (err, result) {
                if (err) {
                    console.log(err);
                    return callback(err, 'Get User Error');
                }

                return callback(false, false, result);
            });
};