const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DB,
  max: 25, // set pool max size to 20
  idleTimeoutMillis: 5000, // close idle clients after 5 second
});

module.exports = pool;
