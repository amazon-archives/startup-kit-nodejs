CREATE TABLE todo ( 
    todo_id SERIAL PRIMARY KEY, 
    active BOOLEAN NOT NULL, 
    description VARCHAR(800) NOT NULL
);
