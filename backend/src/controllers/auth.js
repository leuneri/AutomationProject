const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db     = require("../config/db");

const SECRET = process.env.JWT_SECRET || "changeme";

const registerValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("name").trim().notEmpty(),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

async function register(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, name } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      "INSERT INTO users (email, password, name) VALUES ($1,$2,$3) RETURNING id,email,name,role",
      [email, hash, name]
    );
    const user  = rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Email already registered" });
    next(err);
  }
}

async function login(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const { rows } = await db.query(
      "SELECT id,email,name,role,password FROM users WHERE email=$1",
      [email]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "7d" });
    const { password: _, ...safe } = user;
    res.json({ token, user: safe });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const { rows } = await db.query(
      "SELECT id,email,name,role,created_at FROM users WHERE id=$1",
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, registerValidation, login, loginValidation, me };
