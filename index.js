const express = require('express');
const app = express();

var config = require('./config.json');
var images = require('./models/images.js')

var hostWebsite = config.s3Url;
var getImages = images.getImages;


app.use(express.static('./public'));


app.get('/getimages', function (req, res) {
    getImages().then((results) => {
        for (var i = 0; i < results.rows.length; i++) {
            results.rows[i].image = hostWebsite + results.rows[i].image;
        }
        res.json({
            imageData: results.rows
        });
    });
});

app.listen(8080);
