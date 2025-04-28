const mysql = require('mysql2/promise');

const db = mysql.createPool({
    user: "root",
    host: "localhost",
    password: "",
    database: "minecraft",
    // port: process.env.DB_PORT,
});

module.exports = db;