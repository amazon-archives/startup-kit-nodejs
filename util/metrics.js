"use strict";

const nconf = require('nconf'),
      AWS = require('aws-sdk');

AWS.config.update({region: nconf.get('AWS_REGION')});
const cloudWatch = new AWS.CloudWatch();

    
exports.publishMetric = (metricName, latency) => {

    cloudWatch.putMetricData(metricDataHelper(metricName, latency))
              .on('error', (err, res) => console.log(`Error publishing metrics: ${err}`))
              .send();    
}

function metricDataHelper(metricName, latency) {

  let params = {
    MetricData: [ 
     {
      MetricName: `${metricName}_COUNT`, 
      Timestamp: new Date,
      Unit: 'Count',
      Value: 1.0
     },
     {
      MetricName: `${metricName}_LATENCY`, 
      Timestamp: new Date,
      Unit: 'Milliseconds',
      Value: ((latency[0] * 1000.0) + latency[1]/1000000)
     },
    ],
    Namespace: 'STARTUP_KIT/API'  
  }

  return params;
}


