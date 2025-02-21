require('dotenv').config();
const mysql = require('mysql2');

// Création du pool
const connectToDb = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 10, // Nombre maximum de connexions simultanées
    queueLimit: 0,       // Pas de limite pour la file d'attente
});

// Tester la connexion lors du démarrage
connectToDb.getConnection((err, connection) => {
    if (err) {
        console.error('Erreur lors de la connexion à MySQL :', err);
        console.error('Détails de l\'erreur :', err.stack);
    } else {
        console.log('Connexion réussie à MySQL');
        connection.release(); // Libérer la connexion après test
    }
});

module.exports = connectToDb;
