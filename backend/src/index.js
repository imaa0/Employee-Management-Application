require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./lib/db");
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// ── CORS (must come first, even before body parsers) ─────────────────────────
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  maxAge: 86400,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight for all routes

// ── DB connection middleware ──────────────────────────────────────────────────
// On Vercel every request may hit a cold start; we must await the connection
// before any route handler runs. The connectDB function caches the connection
// so subsequent warm calls resolve instantly.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    res.status(503).json({
      success: false,
      error: "Database unavailable – please try again shortly",
    });
  }
});

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "WorkMate EMS API is running",
    timestamp: new Date().toISOString(),
  });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Local dev server (NOT used on Vercel) ─────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 WorkMate EMS API running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
}

// ── Export for Vercel serverless ──────────────────────────────────────────────
module.exports = app;
