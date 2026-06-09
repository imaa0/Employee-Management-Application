require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./lib/db");
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ["https://employee-management-application-1q5.vercel.app", "http://localhost:3000"],
  credentials: true,
}));
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

// Export for Vercel Serverless
module.exports = app;
