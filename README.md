# AWS Startup Kit Node.js Workload


An example AWS Elastic Beanstalk project built using Node.js as the platform. It
includes a RESTful API created with Express. Use this example to test out your VPC
and database setup on AWS, or as a starting point for your own projects.

### LAUNCHING THE APP ON AWS

To create an Elastic Beanstalk app using this code:
- First make sure you have created VPC and database stacks in CloudFormation using the [Startup Kit templates](https://github.com/awslabs/startup-kit-templates).
- Next, after reading through the notes below and making sure the app runs locally,
create a S3 bucket (or use an existing one) and put your zipped code in the bucket.
When zipping the code, be sure to zip/compress the contents of the of the folder EXCEPT
the node_modules directory.  Do not zip the top level folder/directory itself.  
- Finally, use the Startup Kit app template to create a stack for the app, selecting
'node' as the stack type.

### STEPS TO BUILD AND RUN LOCALLY

- Database:  either a MySQL or PostgreSQL database should be installed on your
local computer using standard ports.  Set up the database using the applicable 
sql script in the sql directory of the project. 

- At the top level of the project directory, include a config.json file.  To select
a database type, use 'mysql' for MySQL or 'pg' for PostgreSQL as the value for the
DB_CLIENT key.  To enable JWT-based token authentication to protect API routes,
set the value of the AUTH_ENABLED key to true.  An example file where PostgreSQL is 
selected as the database:  

```
    {
        "DB_CLIENT": "pg",
        "DB_HOST": "localhost",
        "DB_USER": "startupadmin",
        "DB_PASSWORD": "changeme",
        "DB_NAME": "StartupDB",
        "DB_MAX_CONNS": 100,
        "AWS_REGION": "us-east-1",
        "AUTH_ENABLED": false,
        "AUTH_JWT_SECRET": "my-secret",
        "AUTH_JWT_TOKENTIME":  6000
    }
```

- To build locally: at the command line in the top level directory, run: npm install.
This command relies on the included package.json file to install all necessary
dependencies.

- To test:  run the following curl commands.  The first fetches all items in the database,
while the second adds items.  When testing against an Elastic Beanstalk environment,
replace localhost:8081 with the Elastic Beanstalk environment URL.  If you enable auth,
include an Authorization header in your curl command.  

```
    curl http://localhost:8081/api/todo/all
    
    curl -X POST -H 'Content-Type: application/json' -d '{"active": true, "description": "What TODO next?"}' http://localhost:8081/api/todo/new

```

### DEPLOYMENT NOTES

Environment variables:  this app uses the nconf module to provide a hierarchy for 
variable overriding.  For this app, the order is command line, environment variables, 
then lastly the local config.json file, which provides defaults for talking to a 
developer's local database.  For the connection to a RDS database, the developer
specifies relevant environment variables when creating the database stack using the
db.cfn.yml CloudFormation template.  These values, which are never committed to source
control for security reasons, flow through to the app creation template.  

To deploy a modified version of the app:  set up the Elastic Beanstalk CLI, and use
the eb deploy command.  Alternatively, you could set up a CI solution.  


