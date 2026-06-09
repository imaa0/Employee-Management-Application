const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

async function seed() {
  const usersFile = path.join(__dirname, "../data/users.json");
  const password = await bcrypt.hash("Admin@123", 12);

  const users = [
    {
      id: "USR-001",
      name: "Admin User",
      email: "admin@workmate.com",
      password,
      role: "admin",
      createdAt: new Date().toISOString(),
    },
  ];

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  console.log("✅ Seed complete!");
  console.log("   Login: admin@workmate.com / Admin@123");
}

seed();
