/**
 * Created by liaobonn on 19/05/17.
 *
 * Route used to handle register
 */

module.exports = function(app, passport){
    app.get('/register', function (request, response) {
        if(request.user){
            request.flash('error', 'You must log out first before registering');
            response.redirect('/');
        }
        response.render('register', {
            title: 'Register',
            description: 'Register for the new account.',
            message: request.flash('signupMessage')
        });
    });

    app.post('/register', passport.authenticate('local-signup', {
        successRedirect : '/profile_update_registration', //where to go on success?
        failureRedirect : '/register',
        failureFlash : true
    }));
}