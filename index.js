const express = require('express');
const app = express();
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
var config = require('./config.json');
var images = require('./models/images.js');
var hostWebsite = config.s3Url;
var getImages = images.getImages;
var middleware = require('./middleware.js');
var uploadToS3 = middleware.uploadToS3;
var saveSubmission = images.saveSubmission;
var images = require('./models/images.js');




var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});



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

app.post('/upload-image', uploader.single('file'), uploadToS3,  function(req, res) {




    // If nothing went wrong the file is already in the uploads directory
    if (req.file) {
        console.log('Success!');


        saveSubmission(req.file.filename, req.body.username, req.body.title, req.body.description)
            .then(() => {
                console.log("Savesubmission function worked", req.body);
                res.json({
                    success: true,
                    filename: hostWebsite + req.file.filename,
                    username: req.body.username,
                    description: req.body.description,
                    title: req.body.title
                });
            });
    } else {
        console.log("fail!");
        res.json({
            success: false
        });
    }
});

app.listen(8080);
