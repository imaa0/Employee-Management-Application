require("dotenv").config();
const { connectDB, Employee } = require("./src/lib/db");
const mongoose = require("mongoose");

const dummyEmployees = [
  { id: "EMP-022", name: "Jane Doe", email: "jane.doe@workmate.com", role: "Frontend Developer", department: "Engineering", status: "Active", joinedDate: "2026-06-10" },
  { id: "EMP-023", name: "Alex Johnson", email: "alex.j@workmate.com", role: "Business Analyst", department: "Product", status: "Active", joinedDate: "2026-06-10" },
  { id: "EMP-024", name: "Sam Wilson", email: "sam.w@workmate.com", role: "Customer Support", department: "Support", status: "Active", joinedDate: "2026-06-10" },
  { id: "EMP-025", name: "Chris Evans", email: "chris.e@workmate.com", role: "Sales Representative", department: "Sales", status: "Inactive", joinedDate: "2026-06-10" },
  { id: "EMP-026", name: "Olivia Brown", email: "olivia.b@workmate.com", role: "Marketing Specialist", department: "Marketing", status: "Active", joinedDate: "2026-06-10" },
  { id: "EMP-027", name: "Liam Davis", email: "liam.d@workmate.com", role: "Database Administrator", department: "Engineering", status: "Active", joinedDate: "2026-06-10" },
  { id: "EMP-028", name: "Sophia Miller", email: "sophia.m@workmate.com", role: "Recruiter", department: "Human Resources", status: "Active", joinedDate: "2026-06-10" },
  { id: "EMP-029", name: "James Wilson", email: "james.w@workmate.com", role: "Legal Counsel", department: "Legal", status: "Active", joinedDate: "2026-06-10" },
  { id: "EMP-030", name: "Isabella Moore", email: "isabella.m@workmate.com", role: "Account Manager", department: "Sales", status: "Active", joinedDate: "2026-06-10" },
  { id: "EMP-031", name: "Mason Martin", email: "mason.m@workmate.com", role: "Office Manager", department: "Operations", status: "Active", joinedDate: "2026-06-10" }
];

async function seedMongo() {
  await connectDB();
  console.log("Adding 10 dummy employees to MongoDB...");
  
  for (const emp of dummyEmployees) {
    await Employee.findOneAndUpdate({ id: emp.id }, emp, { upsert: true, new: true });
  }

  console.log("Successfully seeded 10 employees into MongoDB.");
  process.exit(0);
}

seedMongo().catch((err) => {
  console.error("Error seeding MongoDB:", err);
  process.exit(1);
});
