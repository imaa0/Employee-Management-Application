const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { User } = require("../lib/db");
const { generateToken, requireAuth } = require("../lib/auth");
const { loginSchema, registerSchema } = require("../lib/schemas");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Create new user in Mongoose
    const user = new User({
      id: uuidv4(),
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || "Employee",
    });
    await user.save();

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    });

    res.json({
      success: true,
      message: "Login successful",
      data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, location: user.location, avatar: user.avatar } },
    });
  } catch (err) {
    next(err);
  }
});

router.put("/profile", requireAuth, async (req, res, next) => {
  try {
    const { name, phone, location, avatar } = req.body;
    
    const updated = await User.findOneAndUpdate(
      { id: req.user.id },
      { name, phone, location, avatar },
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ success: false, error: "User not found" });

    const token = generateToken({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      avatar: updated.avatar
    });

    res.json({
      success: true,
      data: { token, user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role, phone: updated.phone, location: updated.location, avatar: updated.avatar } },
    });
  } catch (err) {
    next(err);
  }
});

router.put("/password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({ id: req.user.id });
    
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
