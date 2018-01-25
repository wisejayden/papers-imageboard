const express = require('express');
const app = express();
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');

const bodyParser = require('body-parser');

var config = require('./config.json');
var images = require('./models/images.js');
var hostWebsite = config.s3Url;
var getImages = images.getImages;
var middleware = require('./middleware.js');
var uploadToS3 = middleware.uploadToS3;
var saveSubmission = images.saveSubmission;
var images = require('./models/images.js');
var findImageData = images.findImageData;
var addComment = images.addComment;
var getComments = images.getComments;

app.use(bodyParser.json());


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

app.get('/getimages/:id', function (req, res) {
    console.log("CHECK req.params", req.params);
    getComments(req.params)
    var id = req.params.id;
    getComments(id)
        .then((results) => {
            var commentData = results.rows;
            findImageData(id)
                .then((results) => {
                    results.rows[0].image = hostWebsite + results.rows[0].image;
                    console.log("Checking this", results.rows);
                    console.log("commentData", commentData);

                    res.json({
                        success: true,
                        modalImageData: results.rows,
                        commentData: commentData
                    });
                })
                .catch(() => {
                    res.json({
                        success: false
                    });
                });
        })
        .catch(() => {
            console.log("got comments catch");
        })


});

app.post('/upload-image', uploader.single('file'), uploadToS3,  function(req, res) {
    console.log("Test uploading image req.body", req.body);
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

app.get('/get-comments', function(req, res) {
    console.log("get comments", req.body);
    getComments(req.body.id)
        .then((results) => {
            console.log("Got comments");

            res.json({
                success: true,
                results:results.rows
            });
        });
});


app.post('/submit-comment', function(req, res) {
    console.log('post request working for submitting comment');
    console.log("Testing uploading comment req.body", req.body);
    addComment(req.body.comment, req.body.username, req.body.id)
        .then(() => {
            console.log("Submitted comment into table");
            getComments(req.body.id)
                .then((results) => {
                    res.json({
                        success: true,
                        results: results.rows
                    });
                });
        });
});

app.listen(8080);
