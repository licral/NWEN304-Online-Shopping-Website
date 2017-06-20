DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id SERIAL PRIMARY KEY NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255)
);
