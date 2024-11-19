require('dotenv').config();
const swaggerUi = require('swagger-ui-express')
const express = require('express');
const cors = require('cors')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const app = express();


app.use(cors({origin: "http://localhost:8080"}));
app.use(bodyParser.json())

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME, 
    port: process.env.DB_PORT || 3306, 
});


db.connect((err) => {
    if (err) {
        console.log('ERREUR');
    } else {
        console.log('BRAVO');
        
    }
})

const port = process.env.PORT || 3306;
app.listen(port, () => {
    console.log('SERVER DEMARRE');
})



const userRoutes = require('./routes/users.js')
const quizRoutes = require('./routes/quiz.js')

app.use('/api/users', userRoutes)
app.use('/api/quiz', quizRoutes)
