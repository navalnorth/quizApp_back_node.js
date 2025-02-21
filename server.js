require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

app.use(cors({
    
 }));
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
    socketPath: undefined,
});

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

const port = process.env.PORT || 3000;
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

app.use('/api/quiz/users', userRoutes);
app.use('/api/quiz/quiz', quizRoutes);
