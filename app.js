"use strict";


const log = require('./util/log');

// nconf configures the variable overriding hierarchy:
// command line -> environment variables -> config file
const nconf = require('nconf');
nconf.argv()
     .env()
     .file({ file:'config.json'});

// set up Express and routes
const express = require('express'),
      bodyParser = require('body-parser'),
      responseTime = require('response-time');

const app = express();
app.use(bodyParser.json());

// response time measurement
app.use(responseTime( (req, res, time) => {
    let stat = (req.method + req.url)
                .toUpperCase()
                .replace(/[:\.]/g, '')
                .replace(/\//g, '_');
    log.info(`${stat}_latency ${time}`);
}));

// CORS enablement
app.all('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');
    if ('OPTIONS' == req.method) {
        res.status(200).end();
    } else {
        next();
    }
});

require('./routes/api')(app, express);

// BEGIN LISTENING
app.listen(8081);
log.info('Listening on port 8081 . . . .');




