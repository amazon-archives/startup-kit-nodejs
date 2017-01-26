"use strict";

const nconf = require('nconf');

const knex = require('knex')(
    {
      client: nconf.get('DB_CLIENT'),
      connection: {
        host : nconf.get('DB_HOST'),
        user : nconf.get('DB_USER'),
        password : nconf.get('DB_PASSWORD'),
        database : nconf.get('DB_NAME')
    },
      
    pool: { min: 2, max: nconf.get('DB_MAX_CONNS') }
});

exports.knex = knex;

