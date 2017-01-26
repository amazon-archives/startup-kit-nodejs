"use strict";

// use nconf to configure variable overriding hierarchy:
// command line -> environment variables -> config file
const nconf = require('nconf');
nconf.argv()
    .env()
    .file({ file:'config.json'});

// set up express and routes
const express = require('express'),
      bodyParser = require('body-parser'),
      api = require('./routes/api');

const app = express();
app.use(bodyParser.json());


// ROUTE DECLARATIONS

app.get('/todo/active', api.getActive);

app.put('/todo/active', api.updateActive);

app.get('/todo/complete', api.getComplete);

app.put('/todo/complete', api.markComplete);

app.delete('/todo/complete', api.deleteComplete);

app.get('/todo/all', api.getAll);

app.post('/todo/new', api.createNewTodo);


// BEGIN LISTENING

app.listen(8081);
console.log('Listening on port 8081 . . . .');




