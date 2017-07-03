module.exports = function (app) {
    app.all('*', function (request, response) {
        let pageData = {
            title: "404 404 404 404",
            description: "How many times do I have to tell you, there is no spoon!",
        };

        response.header({
            'Cache-Control': 'public, no-cache, must-revalidate',
            'Expires': new Date(Date.now() + 86400000).toUTCString()
        }).render('404', pageData);
        console.log(`[Log] Someone is poking around. Received: ${request.method} '${request.path}'`);
    });
};
