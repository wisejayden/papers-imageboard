var spicedPg = require('spiced-pg');

var db = spicedPg(process.env.DATABASE_URL || 'postgres:dbadmin:spiced@localhost:5432/imageboard');


module.exports.getImages = function() {
    return db
        .query(
            `SELECT * FROM images`
        )
        .then((results) => {
            return results;
        });
};

module.exports.saveSubmission = function(filename, username, title, description) {
    return db
        .query(
            `INSERT INTO images (image, username, title, description) VALUES ($1, $2, $3, $4) returning title, id, created_at`,
            [filename, username, title, description]
        )
        .then((results) => {
            console.log("New images insert!");
            return results;
        })
        .catch(() => {
            console.log("no luck... :()");
        });
};


// newImages(picme.jpg, jayden, me, picofme)
