const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/index");
const { Employee } = require("../src/lib/db");

// test data builder

const makeEmp = (overrides = {}) => ({
  name: "Test Employee",
  email: `test-${Date.now()}-${Math.random()}@workmate.com`,
  role: "Engineer",
  department: "Engineering",
  status: "Active",
  joinedDate: "2024-01-15",
  ...overrides,
});

// setup before tests

let createdIds = [];

afterAll(async () => {
  // cleanup database
  if (createdIds.length > 0) {
    await Employee.deleteMany({ id: { $in: createdIds } });
  }
  await mongoose.connection.close();
});

// test list employees

describe("GET /api/employees", () => {
  it("returns 200 with success:true and data array", async () => {
    const res = await request(app).get("/api/employees");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("returns pagination metadata", async () => {
    const res = await request(app).get("/api/employees");
    expect(res.body.pagination).toBeDefined();
    expect(typeof res.body.pagination.page).toBe("number");
    expect(typeof res.body.pagination.totalPages).toBe("number");
    expect(typeof res.body.pagination.totalItems).toBe("number");
    expect(typeof res.body.pagination.hasNext).toBe("boolean");
    expect(typeof res.body.pagination.hasPrev).toBe("boolean");
  });

  it("returns stats object with total, active, inactive", async () => {
    const res = await request(app).get("/api/employees");
    expect(res.body.stats).toBeDefined();
    expect(typeof res.body.stats.total).toBe("number");
    expect(typeof res.body.stats.active).toBe("number");
    expect(typeof res.body.stats.inactive).toBe("number");
  });

  it("respects ?limit query param", async () => {
    const res = await request(app).get("/api/employees?limit=2");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.pagination.limit).toBe(2);
  });

  it("respects ?page query param", async () => {
    const res = await request(app).get("/api/employees?page=1&limit=5");
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it("filters by status=Active", async () => {
    const res = await request(app).get("/api/employees?status=Active");
    expect(res.statusCode).toBe(200);
    res.body.data.forEach((emp) => expect(emp.status).toBe("Active"));
  });

  it("filters by status=Inactive", async () => {
    const res = await request(app).get("/api/employees?status=Inactive");
    expect(res.statusCode).toBe(200);
    res.body.data.forEach((emp) => expect(emp.status).toBe("Inactive"));
  });

  it("respects ?sortOrder=asc", async () => {
    const res = await request(app).get(
      "/api/employees?sortBy=name&sortOrder=asc&limit=50"
    );
    expect(res.statusCode).toBe(200);
    const names = res.body.data.map((e) => e.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });
});

// test employees stats

describe("GET /api/employees/stats", () => {
  it("returns 200 with full stats shape", async () => {
    const res = await request(app).get("/api/employees/stats");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      total: expect.any(Number),
      active: expect.any(Number),
      inactive: expect.any(Number),
      departments: expect.any(Number),
      departmentList: expect.any(Array),
      recentHires: expect.any(Array),
      monthlyHires: expect.any(Array),
    });
  });

  it("monthlyHires has 6 entries with month and hires fields", async () => {
    const res = await request(app).get("/api/employees/stats");
    expect(res.body.data.monthlyHires).toHaveLength(6);
    res.body.data.monthlyHires.forEach((entry) => {
      expect(typeof entry.month).toBe("string");
      expect(typeof entry.hires).toBe("number");
    });
  });
});

// test add employee

describe("POST /api/employees", () => {
  it("creates a new employee and returns 201", async () => {
    const payload = makeEmp();
    const res = await request(app).post("/api/employees").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.email).toBe(payload.email);
    expect(res.body.data.id).toMatch(/^EMP-/);
    createdIds.push(res.body.data.id);
  });

  it("assigns a sequential EMP-NNN id", async () => {
    const payload = makeEmp();
    const res = await request(app).post("/api/employees").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.id).toMatch(/^EMP-\d{3}$/);
    createdIds.push(res.body.data.id);
  });

  it("returns 409 on duplicate email", async () => {
    const payload = makeEmp({ email: `dup-${Date.now()}@workmate.com` });

    // First create
    const first = await request(app).post("/api/employees").send(payload);
    expect(first.statusCode).toBe(201);
    createdIds.push(first.body.data.id);

    // Duplicate attempt
    const second = await request(app).post("/api/employees").send(payload);
    expect(second.statusCode).toBe(409);
    expect(second.body.success).toBe(false);
  });

  it("returns 400 for missing required fields", async () => {
    const res = await request(app)
      .post("/api/employees")
      .send({ department: "Engineering" }); // missing name, email, role
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Validation failed");
  });

  it("returns 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/api/employees")
      .send(makeEmp({ email: "not-an-email" }));
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for invalid status value", async () => {
    const res = await request(app)
      .post("/api/employees")
      .send(makeEmp({ status: "Unknown" }));
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("defaults status to Active when omitted", async () => {
    const payload = makeEmp();
    delete payload.status;
    const res = await request(app).post("/api/employees").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe("Active");
    createdIds.push(res.body.data.id);
  });
});

// test get employee by id

describe("GET /api/employees/:id", () => {
  let empId;

  beforeAll(async () => {
    const res = await request(app).post("/api/employees").send(makeEmp());
    empId = res.body.data.id;
    createdIds.push(empId);
  });

  it("returns the employee by id", async () => {
    const res = await request(app).get(`/api/employees/${empId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(empId);
  });

  it("returns 404 for non-existent id", async () => {
    const res = await request(app).get("/api/employees/EMP-NONEXISTENT");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// test update employee

describe("PUT /api/employees/:id", () => {
  let empId;

  beforeAll(async () => {
    const res = await request(app).post("/api/employees").send(makeEmp());
    empId = res.body.data.id;
    createdIds.push(empId);
  });

  it("updates one or more fields and returns updated record", async () => {
    const res = await request(app)
      .put(`/api/employees/${empId}`)
      .send({ name: "Updated Name", status: "Inactive" });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Updated Name");
    expect(res.body.data.status).toBe("Inactive");
  });

  it("returns 404 when updating a non-existent employee", async () => {
    const res = await request(app)
      .put("/api/employees/EMP-NONEXISTENT")
      .send({ name: "Ghost" });
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when body is empty (no fields)", async () => {
    const res = await request(app)
      .put(`/api/employees/${empId}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// test delete employee

describe("DELETE /api/employees/:id", () => {
  it("deletes an existing employee and returns success", async () => {
    const create = await request(app).post("/api/employees").send(makeEmp());
    const id = create.body.data.id;

    const del = await request(app).delete(`/api/employees/${id}`);
    expect(del.statusCode).toBe(200);
    expect(del.body.success).toBe(true);
    expect(del.body.message).toMatch(/deleted/i);

    // Verify it's gone
    const get = await request(app).get(`/api/employees/${id}`);
    expect(get.statusCode).toBe(404);
  });

  it("returns 404 when deleting a non-existent employee", async () => {
    const res = await request(app).delete("/api/employees/EMP-NONEXISTENT");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// test health check

describe("GET /api/health", () => {
  it("returns status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.message).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });
});
