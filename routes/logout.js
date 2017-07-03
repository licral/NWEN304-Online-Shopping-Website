module.exports = function(app){

    app.get('/logout', function(request, response) {
        request.logout();
        response.redirect('/');
    });
}