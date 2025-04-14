const mysql = require('mysql2/promise');

const db = mysql.createPool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    // port: process.env.DB_PORT,
});

module.exports = db;