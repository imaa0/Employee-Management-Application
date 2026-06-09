const express = require("express");
const { Employee } = require("../lib/db");
const { createEmployeeSchema, updateEmployeeSchema, employeeQuerySchema } = require("../lib/schemas");

const router = express.Router();

// GET /api/employees
router.get("/", async (req, res, next) => {
  try {
    const query = employeeQuerySchema.parse(req.query);
    
    let dbQuery = {};

    if (query.search) {
      const term = new RegExp(query.search, "i");
      dbQuery.$or = [
        { name: term },
        { email: term },
        { role: term },
        { department: term }
      ];
    }

    if (query.status && query.status !== "All" && query.status !== "") {
      dbQuery.status = query.status;
    }

    if (query.department) {
      dbQuery.department = new RegExp(`^${query.department}$`, "i");
    }

    // sort
    const field = query.sortBy || "createdAt";
    const sortObj = {};
    sortObj[field] = query.sortOrder === "desc" ? -1 : 1;

    // fetch all for stats, could be optimized later
    const allMatching = await Employee.find(dbQuery);
    const totalItems = allMatching.length;
    
    // stats
    const allEmployees = await Employee.find();
    const stats = {
      total: allEmployees.length,
      active: allEmployees.filter(e => e.status === "Active").length,
      inactive: allEmployees.filter(e => e.status === "Inactive").length,
    };

    const totalPages = Math.ceil(totalItems / query.limit) || 1;
    const page = Math.min(query.page, totalPages) || 1;
    const startIdx = (page - 1) * query.limit;

    const paginated = await Employee.find(dbQuery)
      .sort(sortObj)
      .skip(startIdx)
      .limit(query.limit);

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

// GET /api/employees/stats
router.get("/stats", async (req, res) => {
  try {
    const employees = await Employee.find();
    const departments = [...new Set(employees.map((e) => e.department || "General"))];

    const monthlyHires = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString("en-US", { month: "long" });
      const year = d.getFullYear();
      const month = d.getMonth();
      const count = employees.filter((e) => {
        if (!e.joinedDate) return false;
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
          .sort((a, b) => new Date(b.joinedDate || b.createdAt) - new Date(a.joinedDate || a.createdAt))
          .slice(0, 5),
        monthlyHires,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// GET /api/employees/:id
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findOne({ id: req.params.id });
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// POST /api/employees
router.post("/", async (req, res, next) => {
  try {
    const data = createEmployeeSchema.parse(req.body);

    const exists = await Employee.findOne({ email: new RegExp(`^${data.email}$`, "i") });
    if (exists) {
      return res.status(409).json({ success: false, error: "An employee with this email already exists" });
    }

    const allEmps = await Employee.find();
    let nextIdNum = allEmps.length + 1;
    
    const newEmployee = new Employee({
      id: `EMP-${String(nextIdNum).padStart(3, "0")}`,
      ...data,
      joinedDate: data.joinedDate || new Date().toISOString(),
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: newEmployee,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id
router.put("/:id", async (req, res, next) => {
  try {
    const data = updateEmployeeSchema.parse(req.body);
    const updated = await Employee.findOneAndUpdate(
      { id: req.params.id },
      data,
      { new: true }
    );

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

// DELETE /api/employees/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await Employee.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
