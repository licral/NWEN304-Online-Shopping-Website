module.exports = function (app, pool) {
    const fs = require("fs");
    const path = require('path');

    app.post("/archive", isAdmin, function (request, response) {
        // request.body example: { '16': 'on', '17': 'on', '18': 'on' }
        let arrayOfIds = Object.keys(request.body);

        if (arrayOfIds.length > 0) {
            const archiver = require("../services/order_archiver");
            let fileName = new Date().toISOString().replace(/:/g, "").split(".")[0] + '.json';
            let dirName = path.join(__dirname, '../archives/orders/');
            let fullPath = dirName + fileName;

            archiver.archiveOrders(pool, arrayOfIds, fullPath, function (error) {
                if (error) {
                    console.error('[ERROR] Query error', error.message, error.stack);
                    request.flash('error', 'Archiving failed, please examine orders with id: ' + arrayOfIds);
                    response.redirect('/manage/orders');
                } else {
                    request.flash('message', 'Archiving done. File location: ' + fullPath);
                    response.redirect('/manage/orders');
                }
            });
        } else {
            request.flash('error', 'Please at least select one order to archive');
            response.redirect('/manage/orders');
        }
    });

    app.get("/order_archives", isAdmin, function (request, response) {
        let dirName = path.join(__dirname, '../archives/orders/');
        let pageData = {
            title: 'View order archives',
            description: "View order archives",
            error: request.flash('error')
        };

        let files = fs.readdirSync(dirName);
        if (files.length > 0) {
            pageData.archives = files;
        }

        response.set({
            'Cache-Control': 'public, no-cache, must-revalidate'
        }).render('order_archives', pageData);
    });

    app.get("/order_archives/:file", isAdmin, function (request, response) {
        let fileName = request.params.file;
        let dirName = path.join(__dirname, '../archives/orders/');
        let fullPath = dirName + fileName;

        response.download(fullPath, function(err){
            console.error(err);
            request.flash('error', 'Sorry this file cannot be found');
            response.redirect('/order_archives');
        });
    });
};

function isAdmin(request, response, next) {

    if (request.user) {
        // if user is authenticated in the session, carry on
        if (request.user.is_admin) {
            return next();
        } else {
            // if they aren't redirect them to the home page
            request.flash('error', 'Sorry you do not have permissions to access this content');
            response.redirect('/');
        }
    } else {
        request.flash('error', 'You must be logged in to access this content');
        response.redirect('/login');
    }
}
