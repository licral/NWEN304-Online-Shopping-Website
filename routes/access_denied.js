/**
 * Created by liaobonn on 27/06/17.
 */
module.exports = function(app){
    app.get('/access_denied', function (req, res) {
        console.log("Hello");
        let pageData = {
            title: 'Access Denied',
            description: "Access Denied"
        };

        res.render('access_denied', pageData);
    });
}