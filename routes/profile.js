var validator = require('validator');
var phone = require('phone');

var usersDAO = require('../data_access_objects/users_DAO');
var userDetailsDAO = require('../data_access_objects/user_details_DAO');

module.exports = function(app, pool){

    app.get('/profile_update', isLoggedIn, function (req, res) {
        res.render('profile_update', {
            title: 'Shipping and Billing Details',
            description: 'Update/Add User Details',
            message: req.flash('updateDetailMessage')
        });
    });

    app.get('/profile/:id', isLoggedIn, function (req, res) {
        usersDAO.getRow([req.params.id], pool, function(err,msg,results) {
            if (err) {
                res.status(500).send(msg);
                return;
            }

            if (!results.rows.length) {
                res.status(500).send('Cannot Get /profile/' + req.params.id + ' User does not exist');
                return;
            }

            userDetailsDAO.getRow([results.rows[0].id], pool, function (err, msg, results) {
                if (err) {
                    res.status(500).send(msg);
                    return;
                }

                console.log(results);

                res.render('profile', {
                    title: req.params.id + ' Details',
                    description: 'User Details',
                    first_name: results.first_name,
                    last_name: results.last_name,
                    email: results.email,
                    contact_no: results.contact_no,
                    street: results.street,
                    suburb: results.suburb,
                    city: results.city,
                    country: results.country
                });
            });
        });
    });

    app.post('/profile_update', isLoggedIn, function (req, res){

        var data = req.body;

        var err = validateInput(data);

        if(err)
        {
            client.release();
            req.flash('updateDetailMessage', err);
            res.redirect('/profile_update');
            return;
        }

        phone(data, 'NZL');

        var id = req.user.id;

        var details = [
            data.firstname,
            data.lastname,
            data.phone,
            data.street,
            data.suburb,
            data.city,
            data.country,
            id
        ];

        userDetailsDAO.update(details, pool, function(err, msg) {
            if (err)
            {
                req.flash('updateDetailMessage', msg);
                res.redirect('/profile_update');
                return;
            }

            res.redirect('/');
        })
    });
};

function validateInput(data){

    if(data.firstname == ''){
        return 'name must not be empty';
    }
}

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}