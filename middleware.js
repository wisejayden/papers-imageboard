const knox = require('knox');
const fs = require('fs');

let secrets;

// in production the secrets are environment variables, otherwise stored in json file
if (process.env.NODE_ENV == 'production') {
    secrets = process.env;
} else {
    secrets = require('./secrets');
}

//Connect to Amazon server
const client = knox.createClient({
    key: secrets.awsKey,
    secret: secrets.awsSecret,
    bucket: 'spicedling'
});


// Upload data to website
module.exports.uploadToS3 = function(req, res, next) {
    const s3Request = client.put("/jayden/" + req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    //Next(), on successful response
    s3Request.on('response', s3Response => {
        const wasSuccessful = s3Response.statusCode == 200;
        if (wasSuccessful) {
            console.log("Here is the link - https://s3.amazonaws.com/spicedling/jayden/" + req.file.filename);
            next();
        } else {
            console.log("Middleware Error");
        }
    });
};
