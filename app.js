"use strict";

// use nconf to configure variable overriding hierarchy:
// command line -> environment variables -> config file
const nconf = require('nconf');
nconf.argv()
    .env()
    .file({ file:'config.json'});

// set up express and routes
const express = require('express'),
      bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

require('./routes/api')(app, express);

// BEGIN LISTENING

app.listen(8081);
console.log('Listening on port 8081 . . . .');




