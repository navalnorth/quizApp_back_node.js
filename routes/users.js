const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const mysql = require('mysql2')

const jwt = require('jsonwebtoken');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
})



router.get('/', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
        if (err) { return res.status(500).send(err) }

        const filterUser = results.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            firstname: user.firstname,
            role: user.role,
            created_at: user.created_at
        }));

        res.status(200).json(filterUser);
    });
});



router.post('/register', async (req, res) => {
    const { email, password, name, firstname, role } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const sql = 'INSERT INTO users (email, password, name, firstname, role) VALUES (?, ?, ?, ?, ?)'
    db.query(sql, [email, hashedPassword, name, firstname, role ], (err, result) => {
        if (err) { return res.status(500).send(err) }
        res.status(201).send({message: 'Utilisateur créé' });
    })
})



router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {  return res.status(500).send(err) }

        if (results.length === 0) { return res.status(401).json({ message: 'Email ou mot de passe incorrect' }) }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) { return res.status(401).json({ message: 'Email ou mot de passe incorrect' }) }
        
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )
        
        res.status(200).json({ message: 'Utilisateur connecté', token: token });
    });
});


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, '31HDeuzef3C3RCcrcRCTgfeEFZfrgrz', (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user;
        next();
    });
}





/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Récupère le profil de l'utilisateur
 *     description: Renvoie les informations du profil de l'utilisateur authentifié avec un jeton JWT.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès - Profil de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profil de l'utilisateur"
 *                 user:
 *                   type: object
 *                   example: { "id": 1, "email": "user@example.com", "role": "user" }
 *       401:
 *         description: Non autorisé - Jeton manquant ou invalide
 *       403:
 *         description: Accès refusé - Jeton invalide ou expiré
 */
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Profil de l\'utilisateur', user: req.user });
});





module.exports = router
