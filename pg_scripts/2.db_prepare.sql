/***********************
     Creating tables
 ***********************/

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username CHARACTER VARYING(255) NOT NULL,
    password CHARACTER VARYING(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username CHARACTER VARYING(255) NOT NULL,
    password CHARACTER VARYING(255) NOT NULL,  -- not sure if we need to store their password if we use OATH
    email CHARACTER VARYING(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    last_visit_on TIMESTAMP,

    CONSTRAINT emailFormatCheck CHECK (email ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
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
    is_compilation BOOLEAN NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    -- image_path CHARACTER VARYING(255),
    artist_id INTEGER REFERENCES artists (id)
);

CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title CHARACTER VARYING(255) NOT NULL,
    track_no SMALLINT NOT NULL,
    artist_id INTEGER REFERENCES artists (id),
    album_id INTEGER REFERENCES albums (id)
);


/***********************
  Populating test data
 ***********************/

INSERT INTO admins (username, password) VALUES
    ('admin', 'admin');

INSERT INTO users (username, password, email, created_at) VALUES
    ('123', '123', 'abc@abc.com', default),
    ('Slade', 'slade', 'slade@slade.com', default),
    ('Bonnie', 'bonnie', 'bonnie@bonnie.com', default),
    ('Hector', 'hector', 'hector@hector.com', default);

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
