const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = require("../../routes/users.js");
const db = require("../../server.js");
const bcrypt = require("@bcryptjs");
jest.mock("../../server.js"); // Moquer la base de données

const app = express();
app.use(express.json());
app.use("/users", router);

describe("tests des routes vers users", () => {
  it("devrait créer un utilisateur (POST /register)", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = { username: "user3", password: hashedPassword, role: "user" };

    db.query.mockImplementation((sql, values, callback) => {
      callback(null, { id: 10 });
    });

    return request(app)
      .post("/users/register")
      .send(user)
      .then((response) => {
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: "utilisateur créé" });
      })
      .catch((err) => done(err));
  });

  it("devrait récupérer tous les utilisateurs (GET /)", async () => {
    const mockUsers = [
      { id: 1, username: "admin", password: "1234", role: "admin" },
      { id: 2, username: "user2", role: "user" },
    ];

    db.query.mockImplementation((sql, callback) => {
      callback(null, mockUsers);
    });

    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers); // Ajouter cette vérification pour les utilisateurs
  });

  it("devrait connecter un utilisateur (POST /login)", async () => {
    const hashedPassword = await bcrypt.hash("1234", 10);

    // Simuler un utilisateur avec tous les champs nécessaires pour créer le JWT
    const user = {
      id: 4,
      username: "admin",
      password: hashedPassword,
      role: "admin",
      name: "John",
      lastname: "Doe",
    };

    const secret = "1983";
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: "1d" }
    );

    // Simuler la base de données
    db.query.mockImplementation((sql, values, callback) => {
      callback(null, [user]);
    });

    // Moquer bcrypt.compare pour comparer les mots de passe
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const response = await request(app)
      .post("/users/login")
      .send({ username: "admin", password: "1234" }); // Mot de passe brut envoyé par l'utilisateur

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body.token).toBe(token); // Vérifier que le token correspond
  });
});
