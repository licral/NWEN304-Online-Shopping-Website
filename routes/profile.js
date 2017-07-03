var validator = require('validator');
var phone = require('phone');

var usersDAO = require('../data_access_objects/users_DAO');
var userDetailsDAO = require('../data_access_objects/user_details_DAO');

module.exports = function(app, pool){

    app.get('/profile_update_registration', isLoggedIn, function (request, response) {
        response.render('profile_update', {
            title: 'Shipping and Billing Details',
            description: 'Update/Add User Details',
            message: request.flash('updateDetailMessage'),
            first_name: '',
            last_name: '',
            email: request.user.email,
            contact_no: '',
            street: '',
            suburb: '',
            city: '',
            country: '',
        });
    });

    app.get('/profile/:id', isLoggedIn, function (request, response) {
        if(request.user.username != request.params.id){
            response.flash('error', 'You do not have permission to access this content');
            response.redirect('/profile/' + request.user.username);
            return;
        }
        usersDAO.getRow([request.params.id], pool, function(err,msg,results) {
            if (err) {
                response.status(500).send(msg);
                return;
            }

            if (!results.rows.length) {
                response.status(400).send('Cannot Get /profile/' + request.params.id + ' User does not exist');
                return;
            }

            var userResults = results.rows[0];

            userDetailsDAO.getRow([userResults.id], pool, function (err, msg, results) {
                if (err) {
                    response.status(500).send(msg);
                    return;
                }

                console.log(results);

                response.render('profile', {
                    title: 'View Profile',
                    description: 'User Details',
                    first_name: results.first_name,
                    last_name: results.last_name,
                    email: userResults.email,
                    contact_no: results.contact_no,
                    street: results.street,
                    suburb: results.suburb,
                    city: results.city,
                    country: results.country,
                    message: request.flash('profileMessage'),
                    error: request.flash('error')
                });
            });
        });
    });

    app.get('/profile_update/:id', isLoggedIn, function (request, response){
        if(request.user.username != request.params.id){
            response.flash('error', 'You do not have permission to access this content');
            response.redirect('/profile_update/' + request.user.username);
            return;
        }
        usersDAO.getRow([request.params.id], pool, function(err,msg,results) {
            if (err) {
                response.status(500).send(msg);
                return;
            }

            if (!results.rows.length) {
                response.status(400).send('Cannot Get /profile/' + request.params.id + ' User does not exist');
                return;
            }

            var userResults = results.rows[0];

            userDetailsDAO.getRow([userResults.id], pool, function (err, msg, results) {
                if (err) {
                    response.status(500).send(msg);
                    return;
                }

                response.render('profile_update', {
                    title: 'Shipping and Billing Details',
                    description: 'Update/Add User Details',
                    message: request.flash('updateDetailMessage'),
                    first_name:results.first_name,
                    last_name:results.last_name,
                    email:userResults.email,
                    contact_no: results.contact_no,
                    street: results.street,
                    suburb: results.suburb,
                    city:  results.city,
                    country: results.country,
                    error: request.flash('error')
                });
            });
        });
    });

    app.post('/profile_update', isLoggedIn, function (request, response){

        var data = request.body;

        var err = validateInput(data);

        if(err)
        {
            request.flash('updateDetailMessage', err);
            response.redirect('/profile_update' + request.user.username);
            return;
        }

        phone(data, 'NZL');

        var id = request.user.id;

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
                request.flash('updateDetailMessage', msg);
                response.redirect('/profile_update');
                return;
            }

            request.flash('profileMessage', 'Update Successful');
            response.redirect('/profile/' + request.user.username);
        });
    });
};

function validateInput(data){

    if(data.firstname == ''){
        return 'name must not be empty';
    }

    if(data.phone == ''){
        return 'phone must not be empty';
    }

    if(data.street == ''){
        return 'street must not be empty';
    }

    if(data.suburb == ''){
        return 'suburb must not be empty';
    }
    if(data.city== ''){
        return 'city must not be empty';
    }
    if(data.country == ''){
        return 'country must not be empty';
    }
}

// route middleware to make sure
function isLoggedIn(request, response, next) {

    // if user is authenticated in the session, carry on
    if (request.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    response.flash('error', 'You must be logged in to access this content');
    response.redirect('/login');
}
