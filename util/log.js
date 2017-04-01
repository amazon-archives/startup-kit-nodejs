"use strict";


// NOTE:  Replace this with a logger suitable for production,
// such as Winston or Bunyan.  However, to use those loggers
// with CloudWatch, you'll need to install the CloudWatch Logs
// agent on your EC2 instances.

exports.info = (msg) => {
    
    console.log(`[${new Date().toLocaleString('en-US')}] [INFO] ${msg}`);
}

exports.warn = (msg) => {
    
    console.log(`[${new Date().toLocaleString('en-US')}] [WARN] ${msg}`);
}

exports.error = (msg) => {
    
    console.log(`[${new Date().toLocaleString('en-US')}] [ERROR] ${msg}`);
}
