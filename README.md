# AWS Startup Kit Node.js Workload


A sample AWS Elastic Beanstalk project built using Node.js as the platform. It
provides a RESTful API created with Express, for a simple use case:  a TODO app. 
Use this sample to test out your VPC, app, and database setup on AWS. In other words,
you can use the sample app to make sure the different parts of your infrastructure
are communicating with each other. Afterwards, simply replace this sample app with
your own app.  

Follow the instructions directly below to launch the sample app on AWS, or if you
would prefer to check how it runs locally first, skip to the section **STEPS TO 
BUILD AND RUN LOCALLY**.

### LAUNCHING THE APP ON AWS

To create an Elastic Beanstalk app on AWS using this code:
- Using the [Startup Kit templates](https://github.com/awslabs/startup-kit-templates),
launch AWS CloudFormation stacks that include the following templates:  vpc.cfn.yml, 
bastion.cfn.yml, and db.cfn.yml.
- Connect to your RDS database with a database client.  For an example of how to connect
to a database in a private subnet using a bastion host, see the following blog post:
https://aws.amazon.com/blogs/startups/building-a-vpc-with-the-aws-startup-kit/.
- Then, using the database name you provided when you created the database stack, run the 
command CREATE DATABASE [your-database-name] if you don't see that name in the database list.  
Switch to that database.  
- Run the relevant sql script (MySQL or PostgreSQL) from the sql directory of this 
GitHub repository to create the actual database tables. 
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

- Zip the code:  you can do this by running the following command inside the top level
directory containing the source code:
```
    npm run zip
```
(Note: if zipping the code without this command, be sure to zip/compress the contents of
the folder EXCEPT the node_modules directory.  Do NOT zip the top level folder/directory itself, zip the contents only.)
- Either create a S3 bucket to hold your app code, or make sure you have an existing S3 bucket you can use. Put your code in the bucket.
- Launch the elastic-beanstalk.cfn.yml template using AWS CloudFormation, and fill in parameters as follows.  
- Pick a relevant stack name.
- For AppS3Bucket, enter the name of the S3 bucket that contains your code.
- For AppS3Key, enter the name of your code file in the S3 bucket. For example, if your app is a Node.js app, it would be the name of your Node.js code zip file.
- For NetworkStackName, enter the name of the VPC stack you created.
- For DatabaseStackName enter the name of the database stack you created.
- IMPORTANT: before clicking the Create button in the CloudFormation console, go to the Capabilities section just above the button, and be sure you have checked the checkbox acknowledging that IAM resources will be created.

### STEPS TO BUILD AND RUN LOCALLY

- Database intallation:  either a MySQL or PostgreSQL database should be installed on your
local computer using standard ports.  MySQL can be easily installed using a package
downloaded from the [MySQL website](https://dev.mysql.com/downloads/mysql).  For PostgreSQL,
[Postgres.app](http://postgresapp.com) is an easy option for Macs.
- Use the CREATE DATABASE command to create a new database, then switch to it and set up
the database tables by running the applicable sql script (MySQL or PostgreSQL) from the 
sql directory of the project.
- If you haven't done so already, include a config.json file per the directions above 
in the section, **LAUNCHING THE APP ON AWS**.
- To build locally: at the command line in the top level directory, run the install
command below.  It relies on the included package.json file to install all necessary
dependencies.
```
    npm install
```
- To run locally:  first make sure your local database is running.  Then execute the
following command in the top level directory.
```
    node app
```

### TESTING THE APP

- To test without auth:  run the following curl commands.  The first fetches all items in the database, while the second adds items.  When testing against an Elastic Beanstalk environment,
replace localhost:8081 with the Elastic Beanstalk environment URL.

```
    curl http://localhost:8081/api/todo/all
    
    curl -X POST -H 'Content-Type: application/json' -d '{"active": true, "description": "What TODO next?"}' http://localhost:8081/api/todo/new

```

- To test with auth:  if you haven't done so already, in the config.json file, set the value
of the AUTH_ENABLED key to true, and either restart the app (if running locally) or redeploy.
Then run the following curl commands. The first returns an access token, which should be used
to replace MY_AUTH_TOKEN in the second and third API calls.  These calls respectively fetch all
items in the database, and add new items.  When testing against an Elastic Beanstalk environment, replace localhost:8081 with the Elastic Beanstalk environment URL.


```
    curl -X POST -H 'Content-Type: application/json' -d '{"username": "FirstUser", "password": "MyPassword"}' http://localhost:8081/api/auth

    curl -H 'Authorization: Bearer MY_AUTH_TOKEN' http://localhost:8081/api/todo/all
    
    curl -X POST -H 'Authorization: Bearer MY_AUTH_TOKEN' -H 'Content-Type: application/json' -d '{"active": true, "description": "What TODO next?"}' http://localhost:8081/api/todo/new

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
the eb deploy command.  Alternatively, you could use a continuous delivery solution
such as AWS CodePipeline.  


