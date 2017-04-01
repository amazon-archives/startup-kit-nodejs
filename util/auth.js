"use strict";


const nconf = require('nconf'),
      jwt = require('jsonwebtoken'),
      aws = require('./aws'),
      db = require('./db'),
      log = require('./log'),
      bcrypt = require('bcrypt'),
      crypto = require('crypto');

// constants for JWT, time is in seconds
const SECRET = nconf.get('AUTH_JWT_SECRET');
const TOKENTIME = nconf.get('AUTH_JWT_TOKENTIME')


exports.manager = {
  
    create: (user, cb) => {
        
        // if user has a verified property, this was a login, not registration
        if (user.verified) {
            cb(null, user);
            return;
        }
        
        // encrypt password then save user info to db
        bcrypt.hash(user.password, 10, (err, bcryptedPwd) => {
   
            user.pwd = bcryptedPwd;
            // 'password' is a RDMS key word, can't save a column with that name
            delete user.password;  
            
            db.knex.insert(user)
                    .into('users')
                    .returning('user_id')
                    .then( (result) => {
                        log.info(`Successfully created user with id ${result}`);
                        user.id = result[0];
                        cb(null, user);
                    }) 
                    .catch( (err) => {
                        log.error(err);
                        cb(null, err);
            });
        }); 
    },
    
    authenticate: (username, password, cb) => {
    
      db.knex('users')
            .where('username', username)
            .then( (rows) => {
                
                // if no such user, then register user; otherwise, log in
                if (0 === rows.length) {
                    log.info('No such user, registering new user');
                    cb(null, true);
                    return;
                }
        
                // login flow
                let bcryptedPwd = rows[0].pwd;
                // this function compares the plaintext password with the 
                // encrypted password in the db (after decrypting it)
                bcrypt.compare(password, bcryptedPwd, (err, doesMatch) => {

                    if (doesMatch) {
                        // log in
                        log.info('password matched');
                        cb(null, {
                            id: rows[0].user_id,
                            firstname: rows[0].first_name,
                            lastname: rows[0].last_name,
                            email: rows[0].email,
                            verified: true
                        });
                    } else {
                        // deny access
                        log.info('[LOGIN_FAILURE] password DID NOT match');
                        aws.publishMetric('LOGIN_FAILURE');
                        cb(null, false);
                    }
                });
            }) 
            .catch( (err) => {
                log.error(err);
                res.status(500).json({'error' : `[DB ERROR] ${err}`});
            });
      
        }
};

exports.serialize = (req, res, next) => {

    // user has verified property set only for login, not registration
    let userToSerialize = req.user.verified ? req.user : req.body;
    
    this.manager.create(userToSerialize, (err, user) => {
      
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

exports.generateAccessToken = (req, res, next) => {

    req.token = req.token || {};
    req.token.accessToken = jwt.sign({
        id: req.user.id,
        }, SECRET, {
        expiresIn: TOKENTIME
    });

    next();
}

exports.generateRefreshToken = (req, res, next) => {
  
    req.token.refreshToken = req.user.id.toString() + '.' + 
                             crypto.randomBytes(40).toString('hex');
    
    // store token encrypted
    let cipher = crypto.createCipher('aes-256-ctr', SECRET);
    let encrypted = cipher.update(req.token.refreshToken,'utf8','base64');
    encrypted += cipher.final('base64');
    
    db.knex('users')
        .where('user_id', req.user.id)
        .update('refresh_token', encrypted)
        .then( (result) => {
            log.info(`Generated refresh token for user id ${req.user.id}`);
            next();
        })
        .catch( (err) => {
            log.error(err);
            next(err);
        });
}

exports.validateRefreshToken = (req, res, next) => {

    db.knex('users')
        .where('user_id', req.body.id)
        .then( (rows) => {
        
            // decrypt returned token
            let decipher = crypto.createDecipher('aes-256-ctr', SECRET);
            let decrypted = decipher.update(rows[0].refresh_token,'base64','utf8');
            decrypted += decipher.final('utf8');
        
            if (decrypted !== req.body.refreshToken) {
                return res.status(401).json({'error' : 'NO MATCH FOR REFRESH TOKEN'});
            }
            log.info(`Refresh token matched for user ${rows[0].user_id}`);
            req.user = {id: rows[0].user_id};
            next();
        }) 
        .catch( (err) => {
            log.error(err);
            next(err);
        });
}

exports.respondWithToken = (req, res) => {
        
    res.status(200).json({
        user: req.user,
        token: req.token
    });
}


