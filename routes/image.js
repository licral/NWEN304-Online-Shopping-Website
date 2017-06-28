/**
 * Created by liaobonn on 28/05/17.
 */
module.exports = function (app, pool, path) {
    let albumImageSql = "select * from album_images where album_id = $1;";
    let artistImageSql = "select * from artist_images where artist_id = $1;";

    app.get("/image/albums/:size/:id", function (request, response) {
        let id = request.params.id;

        let defaultImagePath;
        switch (request.params.size) {
            case "large":
                defaultImagePath = "350x350_placeholder.png";
                break;
            case "medium":
                defaultImagePath = "175x175_placeholder.png";
                break;
            case "small":
                defaultImagePath = "30x30_placeholder.png";
                break;
        }

        pool.query(albumImageSql, [id])
            .then(result => {
                response.set({
                    'Cache-Control': 'public, max-age=86400',
                    'Expires': new Date(Date.now() + 86400000).toUTCString()
                });

                if (result.rows[0]) {
                    let buffer = new Buffer(result.rows[0].image, "base64");
                    response.type('png').status(200).end(buffer, 'binary');
                } else {
                    response.sendFile(path.join(__dirname, "../public/img", defaultImagePath));
                }
            })
            .catch(e => {
                console.error("[ERROR] Query error", e.message, e.stack);
            });
    });

    app.get("/image/artists/:size/:id", function (request, response) {
        let id = request.params.id;

        let defaultImagePath;
        switch (request.params.size) {
            case "large":
                defaultImagePath = "350x350_placeholder.png";
                break;
            case "medium":
                defaultImagePath = "175x175_placeholder.png";
                break;
            case "small":
                defaultImagePath = "30x30_placeholder.png";
                break;
        }

        pool.query(artistImageSql, [id])
            .then(result => {
                response.set({
                    'Cache-Control': 'public, max-age=86400',
                    'Expires': new Date(Date.now() + 86400000).toUTCString()
                });

                if (result.rows[0]) {
                    let buffer = new Buffer(result.rows[0].image, "base64");
                    response.type('png').status(200).end(buffer, 'binary');
                } else {
                    response.sendFile(path.join(__dirname, "../public/img", defaultImagePath));
                }
            })
            .catch(e => {
                console.error("[ERROR] Query error", e.message, e.stack);
            });
    });
};
