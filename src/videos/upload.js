const AWS = require('aws-sdk');
let S3;
const path = require('path')
if(process.env.IS_OFFLINE === 'true') {
    S3 = new AWS.S3({
        s3ForcePathStyle: true,
        accessKeyId: process.env.ACCESS_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        endpoint: new AWS.Endpoint('http://localhost:4569'),
    });
}else {
    S3 = new AWS.S3();
}

module.exports = async (event) => {

    let fileContent = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;

    const originalFileName = event.pathParameters.fileName
    let fileName = `${Date.now()}`;

    let extension = path.extname(originalFileName)
    console.log('extension is ', extension);

    let fullFileName = `${fileName}${originalFileName}`
    console.log('fullFileName is ', fullFileName);


    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fullFileName,
        Body: fileContent,
        Metadata: {}
    };

    try {
        const stored = await S3.upload(params).promise()
        console.log('stored', stored);
        console.log('responding now');

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'File uploaded successfully',
                location: stored.Location,
                fileKey: stored.Key,
                cloudFrontUrl: `${process.env.CLOUDFRONT_URL}/${baseName(stored.Key)}/output/1M.m3u8`,
                cloudFrontPlaylistUrl: `${process.env.CLOUDFRONT_URL}/${baseName(stored.Key)}/playlist.m3u8`
            })
        }
         


    } catch (err) {
        console.log('storage error', err)
        return {
            statusCode: 400,
            body: JSON.stringify({ err: err })
        }
    }


}


function baseName(path) {
    return path.split('/').reverse()[0].split('.')[0];
}
