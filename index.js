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



//Save uploaded data to harddrive
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


//Loop through image data, adding base url to the extension and then return data
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

//Get comment data and image data by id and then return to modal
app.get('/getimages/:id', function (req, res) {
    getComments(req.params)
    var id = req.params.id;
    getComments(id)
        .then((results) => {
            var commentData = results.rows;
            findImageData(id)
                .then((results) => {
                    results.rows[0].image = hostWebsite + results.rows[0].image;

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


//Save uploaded image to harddrive, then upload to website, once successful saveSubmission to database and return data to the client.
app.post('/upload-image', uploader.single('file'), uploadToS3,  function(req, res) {
    // If nothing went wrong the file is already in the uploads directory
    if (req.file) {
        console.log('Success!');
        saveSubmission(req.file.filename, req.body.username, req.body.title, req.body.description)
            .then(() => {
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


app.post('/submit-comment', function(req, res) {
    addComment(req.body.comment, req.body.username, req.body.id)
        .then(() => {
            res.json({
                success: true,
                comment: req.body.comment,
                username: req.body.username,
                id: req.body.id
            });
        });
});

app.listen(8080);
