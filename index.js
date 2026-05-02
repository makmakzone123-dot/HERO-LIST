const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('Ramos'));

/* ================= MYSQL ================= */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(() => console.log("✅ DB Connected"));

/* ================= AUTH MIDDLEWARE ================= */
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
}

/* ================= REGISTER ================= */
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, password) VALUES (?,?)",
    [username, hashed],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Registered" });
    }
  );
});

/* ================= LOGIN ================= */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username=?",
    [username],
    async (err, result) => {
      if (err || result.length === 0)
        return res.status(400).json({ message: "User not found" });

      const user = result[0];
      const valid = await bcrypt.compare(password, user.password);

      if (!valid)
        return res.status(400).json({ message: "Wrong password" });

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    }
  );
});

/* ================= CHARACTERS ================= */

/* GET ALL */
app.get('/api/characters', auth, (req, res) => {
  db.query("SELECT * FROM characters", (err, result) => {
    res.json(result);
  });
});

/* ADD */
app.post('/api/characters', auth, (req, res) => {
  const { name, role, difficulty, rating } = req.body;

  db.query(
    "INSERT INTO characters (name, role, difficulty, rating) VALUES (?,?,?,?)",
    [name, role, difficulty, rating],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Added" });
    }
  );
});

/* UPDATE */
app.put('/api/characters/:id', auth, (req, res) => {
  const { name, role, difficulty, rating } = req.body;

  db.query(
    "UPDATE characters SET name=?, role=?, difficulty=?, rating=? WHERE id=?",
    [name, role, difficulty, rating, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Updated" });
    }
  );
});

/* DELETE */
app.delete('/api/characters/:id', auth, (req, res) => {
  db.query("DELETE FROM characters WHERE id=?", [req.params.id], () => {
    res.json({ message: "Deleted" });
  });
});

/* ROLE FILTER */
app.get('/api/characters/role/:role', auth, (req, res) => {
  db.query(
    "SELECT * FROM characters WHERE role=?",
    [req.params.role],
    (err, result) => {
      res.json(result);
    }
  );
});

/* STATS */
app.get('/api/stats', auth, (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM characters", (err, t) => {
    db.query("SELECT AVG(rating) AS avgRating FROM characters", (err, a) => {
      res.json({
        total: t[0].total,
        avg: a[0].avgRating
      });
    });
  });
});

/* ================= SERVER ================= */
app.listen(3000, () => console.log("🚀 Running on port 3000"));