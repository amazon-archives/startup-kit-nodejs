"use strict";


const db = require('../util/db'),
      aws = require('../util/aws'),
      auth = require('../util/auth'),
      nconf = require('nconf'),
      expressJwt = require('express-jwt'),
      passport = require('passport'),
      Strategy = require('passport-local');

const authenticate = expressJwt({
  secret: nconf.get('AUTH_JWT_SECRET')
});

// protect routes unless disabled for test
const checkAuth = nconf.get('AUTH_ENABLED') ? authenticate : (req, res, next) => next();

passport.use(new Strategy( (username, password, done) => {
    auth.manager.authenticate(username, password, done);
}));

// EXPORT ROUTES
module.exports = (app, express) => {

    // create a group of API routes
    const apiRoutes = express.Router();
    // set url for API group routes
    app.use('/api', apiRoutes);
    
    // CREATE NEW ITEM
    apiRoutes.post('/todo/new', checkAuth, (req, res) => {

        let hrbegin = process.hrtime();
        let item = req.body;

        db.knex.insert(item)
            .into('todo')
            .returning('todo_id')
            .then( (result) => {
                let msg = `Successfully created todo item with id ${result}`;
                console.log(msg);
                aws.publishMetric('CREATE_NEW', process.hrtime(hrbegin));
                res.status(200).json({'message' : msg});
            }) 
            .catch( (err) => {
                console.error(err);
                res.status(500).json({'error' : `[DB ERROR] ${err}`});
            });
    });

    // GET ACTIVE ITEMS ONLY
    apiRoutes.get('/todo/active', checkAuth, (req, res) => {

        let hrbegin = process.hrtime();

        db.knex('todo')
            .where('active', 1)
            .then( (rows) => {
                console.log(`Active ToDo items found: ${rows.length}`);
                aws.publishMetric('GET_ACTIVE', process.hrtime(hrbegin));
                res.status(200).send(rows);
            }) 
            .catch( (err) => {
                console.error(err);
                res.status(500).json({'error' : `[DB ERROR] ${err}`});
            });
    });

    // UPDATE AN ACTIVE ITEM WITH NEW DESCRIPTION ETC.
    apiRoutes.put('/todo/active', checkAuth, (req, res) => {

        let hrbegin = process.hrtime();
        let item = req.body;

        db.knex('todo')
            .where('todo_id', item.todo_id)
            .update({'description' : item.description, 'active' : item.active})
            .then( (result) => {
                let msg = 'Successfully updated todo';
                console.log(msg);
                aws.publishMetric('UPDATE_ACTIVE', process.hrtime(hrbegin));
                res.status(200).json({'message' : msg});
            })
            .catch( (err) => {
                console.error(err);
                res.status(500).json({'error' : `[DB ERROR] ${err}`});
            });
    });

    // GET ALL ITEMS, ACTIVE AND COMPLETE
    apiRoutes.get('/todo/all', checkAuth, (req, res) => {

        let hrbegin = process.hrtime();

        db.knex.select()
            .table('todo')
            .then( (rows) => {
                console.log(`Total number of ToDo items found: ${rows.length}`);
                aws.publishMetric('GET_ALL', process.hrtime(hrbegin));
                res.status(200).send(rows);
            })
            .catch( (err) => {
                console.error(err);
                res.status(500).json({'error' : `[DB ERROR] ${err}`});
            });
    });

    // GET COMPLETE ITEMS ONLY
    apiRoutes.get('/todo/complete', checkAuth, (req, res) => {

        let hrbegin = process.hrtime();

        db.knex('todo')
            .where('active', 0)
            .then( (rows) => {
                console.log(`Complete ToDo items found: ${rows.length}`);
                aws.publishMetric('GET_COMPLETE', process.hrtime(hrbegin));
                res.status(200).send(rows);
            })
            .catch( (err) => {
                console.error(err);
                res.status(500).json({'error' : `[DB ERROR] ${err}`});
            });
    });

    // MARK AN ACTIVE ITEM COMPLETE
    apiRoutes.put('/todo/complete', checkAuth, (req, res) => {

        let hrbegin = process.hrtime();
        let item = req.body;

        db.knex('todo')
            .where('todo_id', item.todo_id)
            .update('active', 0)
            .then( (result) => {
                let msg = `Successfully marked complete ${result} todos`;
                console.log(msg);
                aws.publishMetric('MARK_COMPLETE', process.hrtime(hrbegin));
                res.status(200).json({'message' : msg});
            })
            .catch( (err) => {
                console.error(err);
                res.status(500).json({'error' : `[DB ERROR] ${err}`});
            });
    });

    // DELETE ALL COMPLETED ITEMS
    apiRoutes.delete('/todo/complete', checkAuth, (req, res) => {

        let hrbegin = process.hrtime();
        let item = req.body;

        db.knex('todo').where('active', 0)
            .del()
            .then( (result) => {
                let msg = `Successfully deleted ${result} completed todos`;
                console.log(msg);
                aws.publishMetric('DELETE_COMPLETE', process.hrtime(hrbegin));
                res.status(200).json({'message' : msg});
            }) 
            .catch( (err) => {
                console.error(err);
                res.status(500).json({'error' : `[DB ERROR] ${err}`});
            });
    });

    // GET AN S3 UPLOAD URL FOR UPLOADING AN OBJECT FOR A TODO ITEM
    apiRoutes.get('/todo/s3url/:bucket/:key', checkAuth, (req, res) => {

        let bucket = req.params.bucket;
        let key = req.params.key;
        if ( !bucket || !key ) {
            let msg = '[API ERROR] S3 BUCKET PATH PARAMETERS MISSING';
            console.error(msg);
            return res.status(500).json({'error' : msg});
        }

        // Handled by the AWS utility module in the utility directory.
        // Note that this is fine for for smaller files, but as file size approaches the GB
        // range, multipart upload is a better solution.  Presigned URLs don't work with
        // multipart uploads, so use the AWS SDK multipart upload functionality instead.
        aws.getPresignedUrlForS3(bucket, key, res);
    });   
    
    // REGISTER AND LOGIN A USER
    apiRoutes.post('/auth', passport.initialize(), 
                            passport.authenticate('local', { session: false, scope: [] }),
                            auth.serialize, 
                            auth.generateToken, 
                            auth.respondWithToken);

    // CHECK USER INFORMATION
    apiRoutes.get('/me', authenticate, (req, res) => {
        
        res.status(200).json(req.user);
    });
    
    
} // end module exports of routes


