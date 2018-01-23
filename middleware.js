const knox = require('knox');
const fs = require('fs');

let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets'); // secrets.json is in .gitignore
}


const client = knox.createClient({
    key: secrets.awsKey,
    secret: secrets.awsSecret,
    bucket: 'spicedling'
});

module.exports.uploadToS3 = function(req, res, next) {
    const s3Request = client.put("/jayden/" + req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on('response', s3Response => {
        const wasSuccessful = s3Response.statusCode == 200;
        console.log("THis is what I want to test", req.body);
        // res.json({
        //     success: wasSuccessful
        // });
        if (wasSuccessful) {
            console.log("Here is the link - https://jayden.s3.amazonaws.com/spicedling/jayden/" + req.file.filename);
            next();
        } else {
            console.log("middleware errorerrrorerororooeeroror");
        }
    });
};
