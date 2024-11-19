require('dotenv').config();
const express = require('express');
const cors = require('cors')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const app = express();


app.use(cors({origin: "http://localhost:8080"}));
app.use(bodyParser.json())

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER, 
    password: process.env.MYSQLPASSWORD, 
    database: process.env.MYSQLDATABASE, 
    port: process.env.MYSQLPORT || 3306, 
});


db.connect((err) => {
    if (err) {
        console.log('ERREUR');
    } else {
        console.log('BRAVO');
        
    }
})

const port = process.env.PORT || 3300;
app.listen(port, () => {
    console.log('SERVER DEMARRE');
})

db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
        console.error('Erreur de connexion à MySQL :', err);
    } else {
        console.log('Connexion réussie à MySQL, résultat :', results[0].solution);
    }
});



const userRoutes = require('./routes/users.js')
const quizRoutes = require('./routes/quiz.js')

app.use('/api/users', userRoutes)
app.use('/api/quiz', quizRoutes)
