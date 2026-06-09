const mongoose = require("mongoose");
const dns = require("dns");

// Force Node.js to use Google/Cloudflare DNS locally
if (process.env.NODE_ENV !== "production") {
  try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Throw the error so it can be logged, but DO NOT exit the process.
    throw new Error("MongoDB Connection Error");
  }
};

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Employee" },
  phone: String,
  location: String,
  avatar: String,
}, { timestamps: true });

const employeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: String,
  department: String,
  status: { type: String, default: "Active" },
  joinedDate: String,
  avatar: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

module.exports = { connectDB, User, Employee };
