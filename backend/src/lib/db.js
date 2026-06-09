const mongoose = require("mongoose");

// ── Connection cache (reused across warm lambda invocations) ──────────────────
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        console.log(`✅ MongoDB Connected: ${m.connection.host}`);
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset so the next call retries
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};

// ── Schemas & Models ──────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    id:       { type: String, required: true, unique: true },
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, default: "Employee" },
    phone:    String,
    location: String,
    avatar:   String,
  },
  { timestamps: true }
);

const employeeSchema = new mongoose.Schema(
  {
    id:         { type: String, required: true, unique: true },
    name:       { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    role:       String,
    department: String,
    status:     { type: String, default: "Active" },
    joinedDate: String,
    avatar:     String,
  },
  { timestamps: true }
);

const User     = mongoose.models.User     || mongoose.model("User", userSchema);
const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

module.exports = { connectDB, User, Employee };
