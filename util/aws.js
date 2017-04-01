"use strict";

const nconf = require('nconf'),
      AWS = require('aws-sdk'),
      log = require('./log');

AWS.config.update({region: nconf.get('AWS_REGION')});

// S3 functions

const s3 = new AWS.S3();

exports.getPresignedUrlForS3 = (bucket, key, res) => {

    let params = { Bucket: bucket, Key: key, Expires: 600 };
    
    s3.getSignedUrl('putObject', params, (err, url) => {
        
        if (err) {
          log.error(err);
          return res.json({'error' : `[AWS S3 ERROR] ${err}`});
        }
        
        let msg = `RETRIEVED S3 PRESIGNED URL = ${url}`;
        log.info(msg);
        res.json({'message' : msg});
    });
}


// CloudWatch metrics functions

const cloudWatch = new AWS.CloudWatch();

// NOTE:  this does not perform batching, which would be necessary for metrics
// that need to be published frequently, e.g. multiple times per second
exports.publishMetric = (metricName) => {

    cloudWatch.putMetricData(metricDataHelper(metricName))
              .on('error', (err, res) => log.error(`Error publishing metrics: ${err}`))
              .send();    
}

function metricDataHelper(metricName) {

    let params = {
        MetricData: [ 
         {
          MetricName: `${metricName}_COUNT`, 
          Timestamp: new Date,
          Unit: 'Count',
          Value: 1.0
         }
        ],
        Namespace: 'STARTUP_KIT/API'  
    }

    return params;
}


