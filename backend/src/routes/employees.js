const express = require("express");
const { v4: uuidv4 } = require("uuid");
const {
  getEmployees,
  findEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../lib/db");
const {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
} = require("../lib/schemas");

const router = express.Router();

// ─── GET /api/employees ─────────────────────────────────────────────────────
router.get("/", (req, res, next) => {
  try {
    const query = employeeQuerySchema.parse(req.query);
    let employees = getEmployees();

    // ── Search by name or email ──
    if (query.search) {
      const term = query.search.toLowerCase();
      employees = employees.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term) ||
          (e.role && e.role.toLowerCase().includes(term)) ||
          (e.department && e.department.toLowerCase().includes(term))
      );
    }

    // ── Filter by status ──
    if (query.status && query.status !== "All" && query.status !== "") {
      employees = employees.filter((e) => e.status === query.status);
    }

    // ── Filter by department ──
    if (query.department) {
      employees = employees.filter(
        (e) =>
          e.department &&
          e.department.toLowerCase() === query.department.toLowerCase()
      );
    }

    // ── Sorting ──
    employees.sort((a, b) => {
      const field = query.sortBy;
      const valA = (a[field] || "").toString().toLowerCase();
      const valB = (b[field] || "").toString().toLowerCase();
      const cmp = valA.localeCompare(valB);
      return query.sortOrder === "desc" ? -cmp : cmp;
    });

    // ── Stats (before pagination) ──
    const stats = {
      total: employees.length,
      active: employees.filter((e) => e.status === "Active").length,
      inactive: employees.filter((e) => e.status === "Inactive").length,
    };

    // ── Pagination ──
    const totalItems = employees.length;
    const totalPages = Math.ceil(totalItems / query.limit) || 1;
    const page = Math.min(query.page, totalPages);
    const startIdx = (page - 1) * query.limit;
    const paginated = employees.slice(startIdx, startIdx + query.limit);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        page,
        limit: query.limit,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/employees/stats ───────────────────────────────────────────────
router.get("/stats", (req, res) => {
  const employees = getEmployees();
  const departments = [...new Set(employees.map((e) => e.department || "General"))];

  // Monthly hires for chart (last 6 months)
  const monthlyHires = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = d.toLocaleString("en-US", { month: "long" });
    const year = d.getFullYear();
    const month = d.getMonth();
    const count = employees.filter((e) => {
      const jd = new Date(e.joinedDate);
      return jd.getFullYear() === year && jd.getMonth() === month;
    }).length;
    monthlyHires.push({ month: monthStr, hires: count });
  }

  res.json({
    success: true,
    data: {
      total: employees.length,
      active: employees.filter((e) => e.status === "Active").length,
      inactive: employees.filter((e) => e.status === "Inactive").length,
      departments: departments.length,
      departmentList: departments,
      recentHires: [...employees]
        .sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate))
        .slice(0, 5),
      monthlyHires,
    },
  });
});

// ─── GET /api/employees/:id ─────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const employee = findEmployeeById(req.params.id);
  if (!employee) {
    return res.status(404).json({ success: false, error: "Employee not found" });
  }
  res.json({ success: true, data: employee });
});

// ─── POST /api/employees ────────────────────────────────────────────────────
router.post("/", (req, res, next) => {
  try {
    const data = createEmployeeSchema.parse(req.body);

    // Check duplicate email
    const employees = getEmployees();
    const exists = employees.find(
      (e) => e.email.toLowerCase() === data.email.toLowerCase()
    );
    if (exists) {
      return res.status(409).json({
        success: false,
        error: "An employee with this email already exists",
      });
    }

    const newEmployee = {
      id: `EMP-${String(employees.length + 1).padStart(3, "0")}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addEmployee(newEmployee);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: newEmployee,
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/employees/:id ─────────────────────────────────────────────────
router.put("/:id", (req, res, next) => {
  try {
    const data = updateEmployeeSchema.parse(req.body);
    const updated = updateEmployee(req.params.id, data);

    if (!updated) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/employees/:id ──────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const deleted = deleteEmployee(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: "Employee not found" });
  }
  res.json({ success: true, message: "Employee deleted successfully" });
});

module.exports = router;
