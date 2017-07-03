/***********************
     Creating tables
 ***********************/

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    displayname CHARACTER VARYING NOT NULL,
    username CHARACTER VARYING UNIQUE NOT NULL,
    password CHARACTER VARYING NOT NULL,
    email CHARACTER VARYING UNIQUE NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT false
);

DROP TABLE IF EXISTS user_details CASCADE;
CREATE TABLE IF NOT EXISTS user_details (
    id SERIAL PRIMARY KEY,
    first_name CHARACTER VARYING,
    last_name CHARACTER VARYING,
    contact_no CHARACTER VARYING,
    street CHARACTER VARYING,
    suburb CHARACTER VARYING,
    city CHARACTER VARYING,
    country CHARACTER VARYING,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users (id) ,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    last_visit_on TIMESTAMP NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS shopping_carts CASCADE;
CREATE TABLE IF NOT EXISTS shopping_carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS shopping_cart_details CASCADE;
CREATE TABLE IF NOT EXISTS shopping_cart_details (
    id SERIAL PRIMARY KEY,
    shopping_cart_id INTEGER NOT NULL REFERENCES shopping_carts (id) ON DELETE CASCADE ON UPDATE CASCADE,
    album_id INTEGER NOT NULL REFERENCES albums (id) ON DELETE CASCADE ON UPDATE CASCADE,
    quantity INTEGER NOT NULL,

    CONSTRAINT quantityCheck CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    artist_name CHARACTER VARYING NOT NULL,
    description CHARACTER VARYING
);

CREATE TABLE IF NOT EXISTS artist_images (
    id SERIAL PRIMARY KEY,
    image TEXT NOT NULL,
    artist_id INTEGER UNIQUE NOT NULL REFERENCES artists (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS albums (
    id SERIAL PRIMARY KEY,
    title CHARACTER VARYING NOT NULL,
    description CHARACTER VARYING,
    released_on DATE,
    genre CHARACTER VARYING,
    is_compilation BOOLEAN NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    artist_id INTEGER REFERENCES artists (id) ON UPDATE CASCADE,

    CONSTRAINT priceCheck CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS album_images (
    id SERIAL PRIMARY KEY,
    image TEXT NOT NULL,
    album_id INTEGER UNIQUE NOT NULL REFERENCES albums (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title CHARACTER VARYING NOT NULL,
    track_no SMALLINT NOT NULL,
    artist_id INTEGER REFERENCES artists (id) ON UPDATE CASCADE,
    album_id INTEGER REFERENCES albums (id) ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON UPDATE CASCADE,
    order_time TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS order_details (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders (id) ON UPDATE CASCADE,
    album_id INTEGER NOT NULL REFERENCES albums (id) ON UPDATE CASCADE,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,

    CONSTRAINT quantityCheck CHECK (quantity > 0),
    CONSTRAINT priceCheck CHECK (price >= 0)
);


/***********************
  Functions
 ***********************/

 CREATE OR REPLACE FUNCTION insert(username text, password text, email text, displayname text)
   RETURNS "users"."id"%TYPE
   AS
     $$
     DECLARE
       DECLARE id_var int;
     BEGIN

    	INSERT INTO users (displayname, username, password, email) values ($4,$1,$2,$3) RETURNING id INTO id_var;
 	    INSERT INTO user_details (user_id) values (id_var);
 	    INSERT INTO shopping_carts (user_id) values (id_var);

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
