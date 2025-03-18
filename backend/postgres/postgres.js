const { Pool } = require('pg');
require('dotenv').config();

const db_config = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT)
};

const pool = new Pool(db_config);

module.exports = { pool };