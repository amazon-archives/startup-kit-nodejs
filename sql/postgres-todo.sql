CREATE TABLE todo ( 
    todo_id SERIAL PRIMARY KEY, 
    active BOOLEAN NOT NULL, 
    description VARCHAR(1024) NOT NULL
);

CREATE TABLE users ( 
    user_id SERIAL PRIMARY KEY, 
    username VARCHAR(64) UNIQUE, 
    pwd VARCHAR(512) NOT NULL,
    first_name VARCHAR(64),
    last_name VARCHAR(64),
    email VARCHAR(128)
);
