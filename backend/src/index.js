require("dotenv").config();
const express = require("express");
const app = express();

try {
  const { connectDB } = require("./lib/db");
  const authRoutes = require("./routes/auth");
  const employeeRoutes = require("./routes/employees");
  const { errorHandler } = require("./middleware/errorHandler");

  const PORT = process.env.PORT || 5000;

  // Connect to MongoDB
  connectDB().catch(e => console.error(e));

  // ─── Manual CORS Middleware (works on Vercel Serverless) ─────────────────────
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  // Immediately respond to preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "WorkMate EMS API is running", timestamp: new Date().toISOString() });
});

// Error Handler
app.use(errorHandler);

// Only listen when running locally (not on Vercel)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`\n🚀 WorkMate EMS API running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
}

} catch (globalError) {
  app.use((req, res) => {
    res.status(500).json({ error: "FATAL_INIT_ERROR", message: globalError.message, stack: globalError.stack });
  });
}

// Export for Vercel Serverless
module.exports = app;
