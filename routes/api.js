"use strict";

const db = require('../util/db'),
      metrics = require('../util/metrics');


exports.createNewTodo = (req, res) => {
    
    let hrbegin = process.hrtime();
    let item = req.body;
    
    db.knex.insert(item)
        .into('todo')
        .then( (result) => {
            let msg = 'Successfully created todo';
            console.log(msg);
            metrics.publishMetric('CREATE_NEW', process.hrtime(hrbegin));
            res.json({'message' : msg});
        }) 
        .catch( (err) => {
            console.error(err);
            res.json({'error' : `[DB ERROR] ${err}`});
        });
}

exports.getActive = (req, res) => {

    let hrbegin = process.hrtime();
    
    db.knex('todo')
        .where('active', 1)
        .then( (rows) => {
            console.log(`Active ToDo items found: ${rows.length}`);
            metrics.publishMetric('GET_ACTIVE', process.hrtime(hrbegin));
            res.send(rows);
        }) 
        .catch( (err) => {
            console.error(err);
            res.json({'error' : `[DB ERROR] ${err}`});
        });
}

exports.updateActive = (req, res) => {
    
    let hrbegin = process.hrtime();
    let item = req.body;
    
    db.knex('todo')
        .where('todo_id', item.todo_id)
        .update({'description' : item.description, 'active' : item.active})
        .then( (result) => {
            let msg = 'Successfully updated todo';
            console.log(msg);
            metrics.publishMetric('UPDATE_ACTIVE', process.hrtime(hrbegin));
            res.json({'message' : msg});
        })
        .catch( (err) => {
            console.error(err);
            res.json({'error' : `[DB ERROR] ${err}`});
        });
}

exports.getAll = (req, res) => {
    
    let hrbegin = process.hrtime();
    
    db.knex.select()
        .table('todo')
        .then( (rows) => {
            console.log(`Total number of ToDo items found: ${rows.length}`);
            metrics.publishMetric('GET_ALL', process.hrtime(hrbegin));
            res.send(rows);
        })
        .catch( (err) => {
            console.error(err);
            res.json({'error' : `[DB ERROR] ${err}`});
        });
}

exports.getComplete = (req, res) => {
    
    let hrbegin = process.hrtime();
    
    db.knex('todo')
        .where('active', 0)
        .then( (rows) => {
            console.log(`Complete ToDo items found: ${rows.length}`);
            metrics.publishMetric('GET_COMPLETE', process.hrtime(hrbegin));
            res.send(rows);
        })
        .catch( (err) => {
            console.error(err);
            res.json({'error' : `[DB ERROR] ${err}`});
        });
}

exports.markComplete = (req, res) => {
    
    let hrbegin = process.hrtime();
    let item = req.body;
    
    db.knex('todo')
        .where('todo_id', item.todo_id)
        .update('active', 0)
        .then( (result) => {
            let msg = `Successfully marked complete ${result} todos`;
            console.log(msg);
            metrics.publishMetric('MARK_COMPLETE', process.hrtime(hrbegin));
            res.json({'message' : msg});
        })
        .catch( (err) => {
            console.error(err);
            res.json({'error' : `[DB ERROR] ${err}`});
        });
}

exports.deleteComplete = (req, res) => {
    
    let hrbegin = process.hrtime();
    let item = req.body;
    
    db.knex('todo').where('active', 0)
        .del()
        .then( (result) => {
            let msg = `Successfully deleted ${result} completed todos`;
            console.log(msg);
            metrics.publishMetric('DELETE_COMPLETE', process.hrtime(hrbegin));
            res.json({'message' : msg});
        }) 
        .catch( (err) => {
            console.error(err);
            res.json({'error' : `[DB ERROR] ${err}`});
        });
}


