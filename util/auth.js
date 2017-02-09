"use strict";


const nconf = require('nconf'),
      jwt = require('jsonwebtoken');

// constants for JWT, time is in seconds
const SECRET = nconf.get('AUTH_JWT_SECRET');
const TOKENTIME = nconf.get('AUTH_JWT_TOKENTIME')

// NOTE:  currently there is no provision for refresh tokens

exports.manager = {
  
  // replace these functions' bodies with database or Amazon Cognito API calls
  updateOrCreate: function(user, cb) {
    
    // TODO:  replace this with real API calls
    // just returns the user info submitted in the API call
    cb(null, user);
  },
    
  authenticate: function(username, password, cb) {
      
    // TODO:  replace this test data with API calls
    if (username === 'test-user' && password === 'test123') {
      cb(null, {
        id: 123,
        firstname: 'john',
        lastname: 'doe',
        email: 'john@mycompany.com',
        verified: true
      });
    } else {
      cb(null, false);
    }
  }
};

exports.serialize = (req, res, next) => {
    
  this.manager.updateOrCreate(req.user, function(err, user) {
      
    if (err) {
      return next(err);
    }
      
    // req.user contains necessary info for tokens
    req.user = {
      id: user.id
    };
      
    next();
  });
}

exports.generateToken = (req, res, next) => {
    
  req.token = jwt.sign({
    id: req.user.id,
  }, SECRET, {
    expiresIn: TOKENTIME
  });
    
  next();
}

exports.respondWithToken = (req, res) => {
    
  res.status(200).json({
    user: req.user,
    token: req.token
  });
}


