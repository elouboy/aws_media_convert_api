const AWS = require('aws-sdk');
const elasticTranscoder = new AWS.ElasticTranscoder({
    apiVersion: '2012-09-25',
    region: process.env.REGION
});


module.exports = (event, context, callback) => {
    console.log('video convert event is ', event);
    console.log('region', process.env.REGION);
    const record = event.Records[0];
    const key = record.s3.object.key;
    const filename = key;
    const filesize = record.s3.object.size;
    console.log(`New object has been created: ${key} (${filesize} bytes)`);
    console.log('object data', JSON.stringify(record.s3.object));
    const sourceKey = decodeURIComponent(filename.replace(/\+/g, ' '));
    console.log("Source key:", sourceKey);
    const outputKey = sourceKey.split('.')[0];
    console.log("Output key:", outputKey);
    // get the folder name
    const folderName = baseName(key);
    console.log("folderName key:", folderName);

    const segmentDuration = process.env.SEGMENT_DURATION || 10

    /*
        HLS v3 (Apple HTTP Live Streaming), 2 megabits/second 1351620000001-200010

        HLS v3 and v4 (Apple HTTP Live Streaming), 2 megabits/second, Video-only 1351620000001-200015

        HLS v3 (Apple HTTP Live Streaming), 1.5 megabits/second 1351620000001-200020

        HLS v3 and v4 (Apple HTTP Live Streaming), 1.5 megabits/second, Video-only 1351620000001-200025

        HLS v3 (Apple HTTP Live Streaming), 1 megabit/second 1351620000001-200030

        HLS v3 and v4 (Apple HTTP Live Streaming), 1 megabit/second, Video-only 1351620000001-200035
            {
                Key: 'web-480p' + '.mp4',
                PresetId: '1351620000001-000020' //480p 16:9 format
            },
            {
                Key: 'output/2M',
                PresetId: '1351620000001-200010', // HLS v3 and v4 (Apple HTTP Live Streaming), 2 megabits/second,
                SegmentDuration: segmentDuration,
            },
            {
                Key: 'output/15M',
                PresetId: '1351620000001-200020', // HLS v3 and v4 (Apple HTTP Live Streaming), 1.5 megabits/second,
                SegmentDuration: segmentDuration,
            },
    */
    const params = {
        PipelineId: process.env.ELASTIC_TRANSCODER_PIPELINE_ID,
        OutputKeyPrefix: folderName + '/',
        Input: {
            Key: sourceKey,
            // FrameRate: 'auto',
            // Resolution: 'auto',
            // AspectRatio: 'auto',
            // Interlaced: 'auto',
            // Container: 'auto'
        },
        Outputs: [
            {
                Key: 'output/1M',
                PresetId: '1351620000001-200030', // HLS v3 and v4 (Apple HTTP Live Streaming), 1 megabit/second,
                SegmentDuration: segmentDuration,
            },
            {
                Key: 'output/2M',
                PresetId: '1351620000001-200010', // HLS v3 and v4 (Apple HTTP Live Streaming), 2 megabits/second,
                SegmentDuration: segmentDuration,
            },
            {
                Key: 'output/15M',
                PresetId: '1351620000001-200020', // HLS v3 and v4 (Apple HTTP Live Streaming), 1.5 megabits/second,
                SegmentDuration: segmentDuration,
            },

        ],
        Playlists: [
            {
                Format: 'HLSv3',
                Name:  'playlist',
                OutputKeys: [ 'output/1M', 'output/2M', 'output/15M']
            }
        ]
    };

    console.log("Creating elastic transcoder job with params.", JSON.stringify(params));
    const response = elasticTranscoder.createJob(params, function (error, data) {
        if (error) {
            console.log("Error creating elastic transcoder job.", error);
            callback(error);
        }else {
            // the transcoding job started, so let's make a record in firebase
            // that the UI can show right away
            console.log("Elastic transcoder job created successfully", data);
            callback(data);

        }
    });
    console.log('response from createJob is', response);
    console.log('response', JSON.stringify(response.params.Outputs));
    console.log('video convert done');
}


function baseName(path) {
    return path.split('/').reverse()[0].split('.')[0];
}
