const url = require('url');
const Pool = require('pg-pool');

// the local DB URL needs to be changed to your own settings
let localDBUrl = "postgres://qppxsuhjsvrdlo:34dc457da7ffb9749662aa55458d4348ccc595d12f41056e19b6a40ddf677551@ec2-23-23-227-188.compute-1.amazonaws.com:5432/d5h53moib4fj0q";
let databaseUrl = process.env.DATABASE_URL || localDBUrl;
let params = url.parse(databaseUrl);
let auth = params.auth.split(':');
let sslBoolean = !process.env.DATABASE_URL;

let config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: sslBoolean
};

const pool = new Pool(config);

module.exports = pool;