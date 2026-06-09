const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "WorkMate EMS API is running", timestamp: new Date().toISOString() });
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 WorkMate EMS API running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
