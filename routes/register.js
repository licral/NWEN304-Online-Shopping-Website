/**
 * Created by liaobonn on 19/05/17.
 *
 * Route used to handle register
 */

module.exports = function(app, passport){
    app.get('/register', function (req, res) {
        res.render('register', {
            title: 'Register',
            description: 'Register for the new account.',
            message: req.flash('signupMessage')
        });
    });

    app.post('/register', passport.authenticate('local-signup', {
        successRedirect : '/profile_update', //where to go on success?
        failureRedirect : '/register',
        failureFlash : true
    }));
}