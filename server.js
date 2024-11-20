require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

app.use(cors({ origin: "http://localhost:8080" }));
app.use(bodyParser.json());

// Affiche les variables utilisées pour MySQL (hors production pour débogage)
if (process.env.NODE_ENV !== 'production') {
    console.log("Configuration MySQL :");
    console.log("HOST :", process.env.MYSQLHOST);
    console.log("USER :", process.env.MYSQLUSER);
    console.log("DATABASE :", process.env.MYSQLDATABASE);
    console.log("PORT :", process.env.MYSQLPORT);
}

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD.trim(),
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
});

console.log("Configuration MySQL utilisée :");
console.log("HOST :", process.env.MYSQLHOST);
console.log("USER :", process.env.MYSQLUSER);
console.log("DATABASE :", process.env.MYSQLDATABASE);
console.log("PORT :", process.env.MYSQLPORT);
console.log("PASSWORD :", process.env.MYSQL_ROOT_PASSWORD ? '******' : 'non défini');


db.connect((err) => {
    if (err) {
        console.error('Erreur lors de la connexion à MySQL :', err);
    } else {
        console.log('Connexion réussie à MySQL');
    }
});

if (!process.env.MYSQLPASSWORD || process.env.MYSQLPASSWORD.trim() === '') {
    console.error('Le mot de passe MySQL n\'est pas défini ou est vide.');
    process.exit(1);
}

const port = process.env.PORT || 3300;
app.listen(port, () => {
    console.log('SERVER DEMARRE sur le port', port);
});

// Test MySQL simple
db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
        console.error('Erreur lors de la requête MySQL :', err);
    } else {
        console.log('Test MySQL : résultat =', results[0].solution);
    }
});

const userRoutes = require('./routes/users.js');
const quizRoutes = require('./routes/quiz.js');

app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
