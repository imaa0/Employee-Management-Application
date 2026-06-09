const fs = require("fs");
const path = require("path");

const EMPLOYEES_FILE = path.join(__dirname, "../../data/employees.json");
const USERS_FILE = path.join(__dirname, "../../data/users.json");

/**
 * Generic: read JSON file, return parsed array
 */
function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Generic: write data to JSON file
 */
function writeJSON(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Employee helpers ─────────────────────────────────────────────────────────

function getEmployees() {
  return readJSON(EMPLOYEES_FILE);
}

function saveEmployees(employees) {
  writeJSON(EMPLOYEES_FILE, employees);
}

function findEmployeeById(id) {
  return getEmployees().find((e) => e.id === id) || null;
}

function addEmployee(employee) {
  const employees = getEmployees();
  employees.unshift(employee); // newest first
  saveEmployees(employees);
  return employee;
}

function updateEmployee(id, updates) {
  const employees = getEmployees();
  const idx = employees.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  employees[idx] = { ...employees[idx], ...updates, updatedAt: new Date().toISOString() };
  saveEmployees(employees);
  return employees[idx];
}

function deleteEmployee(id) {
  const employees = getEmployees();
  const idx = employees.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  employees.splice(idx, 1);
  saveEmployees(employees);
  return true;
}

// ─── User helpers ─────────────────────────────────────────────────────────────

function getUsers() {
  return readJSON(USERS_FILE);
}

function saveUsers(users) {
  writeJSON(USERS_FILE, users);
}

function findUserByEmail(email) {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function addUser(user) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
  return user;
}

module.exports = {
  getEmployees,
  saveEmployees,
  findEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getUsers,
  findUserByEmail,
  addUser,
};
