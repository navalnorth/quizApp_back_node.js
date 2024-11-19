require('dotenv').config();
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const express = require('express');
const cors = require('cors')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const app = express();


app.use(cors({origin: "http://localhost:8080"}));
app.use(bodyParser.json())

const isProduction = process.env.NODE_ENV === 'production';

const swaggerOptions = {
    swaggerDefinition : {
        openapi: '3.0.0',
        info: {
            title: 'API quiz',
            version: '0.0.1',
            description: 'Je suis un API',
            contact : {
                name: 'Swagger'
            },
            servers: [{url: 'http://localhost:3306'}]
        }
    },
    apis: ["./routes/*.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs))



const db = mysql.createConnection({
    host: isProduction ? process.env.PROD_DB_HOST : '127.0.0.1',
    user: isProduction ? process.env.PROD_DB_USER : process.env.DB_USER,
    password: isProduction ? process.env.PROD_DB_PASSWORD : process.env.DB_PASSWORD,
    database: isProduction ? process.env.PROD_DB_NAME : process.env.DB_NAME,
    port: isProduction ? (process.env.PROD_PORT || 3306) : 3306, // Défaut sur 3306
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
