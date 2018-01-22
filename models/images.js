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
