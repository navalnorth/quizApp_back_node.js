const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken');
const connectToDb = require('../db.js');



router.post('/register', async (req, res) => {
    const { email, password, name, firstname, role = 'user' } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (email, password, name, firstname, role) VALUES (?, ?, ?, ?, ?)';
    connectToDb.query(sql, [email, hashedPassword, name, firstname, role], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ message: 'Utilisateur créé' });
    });
});



router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            console.warn("Email ou mot de passe manquant :", req.body);
            return res.status(400).json({ message: "Email ou mot de passe manquant." });
        }

        const sql = 'SELECT * FROM users WHERE email = ?';
        connectToDb.query(sql, [email], async (err, results) => {
            if (err) {
                console.error("Erreur lors de l'exécution de la requête SQL :", err);
                return res.status(500).json({ message: "Erreur interne de la base de données", error: err });
            }

            if (results.length === 0) {
                console.warn("Utilisateur non trouvé pour cet email :", email);
                return res.status(401).json({ message: "Email ou mot de passe incorrect." });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                console.warn("Mot de passe incorrect pour cet utilisateur :", email);
                return res.status(401).json({ message: "Email ou mot de passe incorrect." });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET || "default_secret",
                { expiresIn: '1h' }
            );

            console.log("Connexion réussie pour :", email);
            res.status(200).json({ message: "Utilisateur connecté", token: token });
        });
    } catch (error) {
        console.error("Erreur inattendue :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
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

router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Profil de l\'utilisateur', user: req.user });
});



module.exports = router
