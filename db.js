const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'arinc_app',
    password: 'admin', // Pon aquí la contraseña que elegiste
    database: 'avionics_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();