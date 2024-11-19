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
    host: process.env.PROD_DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: 3306,
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
