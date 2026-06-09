const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { findUserByEmail, addUser } = require("../lib/db");
const { generateToken } = require("../lib/auth");
const { loginSchema, registerSchema } = require("../lib/schemas");

const router = express.Router();

// ─── POST /api/auth/register ────────────────────────────────────────────────
router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user already exists
    const existing = findUserByEmail(data.email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists",
      });
    }

    // Hash password and save
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      createdAt: new Date().toISOString(),
    };

    addUser(user);

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────────────────
router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = findUserByEmail(data.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
