/***********************
     Creating tables
 ***********************/

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username CHARACTER VARYING(255) UNIQUE NOT NULL,
    password CHARACTER VARYING(255) NOT NULL
);

DROP TABLE IF EXISTS user_details;
CREATE TABLE IF NOT EXISTS user_details (
    id SERIAL PRIMARY KEY,
    first_name CHARACTER VARYING(255),
    last_name CHARACTER VARYING(255),
    email CHARACTER VARYING(255) UNIQUE NOT NULL,
    contact_no CHARACTER VARYING(255),
    street CHARACTER VARYING(255),
    suburb CHARACTER VARYING(255),
    city CHARACTER VARYING(255),
    country CHARACTER VARYING(255),
    user_id INTEGER REFERENCES users (id),
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    last_visit_on TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    artist_name CHARACTER VARYING(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS albums (
    id SERIAL PRIMARY KEY,
    title CHARACTER VARYING(255) NOT NULL,
    description TEXT,
    released_on DATE,
    genre CHARACTER VARYING(255),
    image BYTEA,
    is_compilation BOOLEAN NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    artist_id INTEGER REFERENCES artists (id)
);

CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title CHARACTER VARYING(255) NOT NULL,
    track_no SMALLINT NOT NULL,
    artist_id INTEGER REFERENCES artists (id),
    album_id INTEGER REFERENCES albums (id)
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS order_details (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders (id),
    album_id INTEGER REFERENCES albums (id),
    quantity INTEGER NOT NULL,

    CONSTRAINT quantityCheck CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS shopping_carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS shopping_cart_details (
    id SERIAL PRIMARY KEY,
    shopping_cart_id INTEGER REFERENCES shopping_carts (id),
    album_id INTEGER REFERENCES albums (id),
    quantity INTEGER NOT NULL,

    CONSTRAINT quantityCheck CHECK (quantity > 0)
);

/***********************
  Functions
 ***********************/

 CREATE OR REPLACE FUNCTION insert(username text, password text, email text)
   RETURNS "users"."id"%TYPE
   AS
     $$
     DECLARE
       DECLARE id_var int;
     BEGIN

    	INSERT INTO users ( username, password ) values ($1,$2) RETURNING id INTO id_var;
 	    INSERT INTO user_details (email,user_id) values ($3,id_var);

 	    RETURN id_var;

    END;
    $$
    LANGUAGE plpgsql;

/***********************
  Populating test data
 ***********************/

INSERT INTO artists (artist_name) VALUES
    ('Various Artist'),
    ('Sonic Youth'),
    ('Kiasmos');

INSERT INTO albums (title, released_on, is_compilation, price, artist_id) VALUES
    ('If I Were a Carpenter', '1994-09-03', true, 29.99, (SELECT id FROM artists WHERE artist_name = 'Various Artist')),
    ('Kiasmos', '2014-10-27', false, 39.99, (SELECT id FROM artists WHERE artist_name = 'Kiasmos'));

INSERT INTO songs (title, track_no, artist_id, album_id) VALUES
    ('Superstar', 3, (SELECT id FROM artists WHERE artist_name = 'Sonic Youth'), (SELECT id FROM albums WHERE title = 'If I Were a Carpenter')),
    ('Looped', 3, (SELECT id FROM artists WHERE artist_name = 'Kiasmos'), (SELECT id FROM albums WHERE title = 'Kiasmos'));
