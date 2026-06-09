const {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
  loginSchema,
  registerSchema,
} = require("../src/lib/schemas");

// create employee data checks

describe("createEmployeeSchema", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@company.com",
    role: "Developer",
    department: "Engineering",
    status: "Active",
    joinedDate: "2024-05-01",
  };

  it("passes with all valid fields", () => {
    expect(() => createEmployeeSchema.parse(valid)).not.toThrow();
  });

  it("lowercases the email", () => {
    const result = createEmployeeSchema.parse({ ...valid, email: "JANE@COMPANY.COM" });
    expect(result.email).toBe("jane@company.com");
  });

  it("defaults status to Active when omitted", () => {
    const { status, ...withoutStatus } = valid;
    const result = createEmployeeSchema.parse(withoutStatus);
    expect(result.status).toBe("Active");
  });

  it("defaults department to General when omitted", () => {
    const { department, ...withoutDept } = valid;
    const result = createEmployeeSchema.parse(withoutDept);
    expect(result.department).toBe("General");
  });

  it("rejects missing name", () => {
    const { name, ...withoutName } = valid;
    expect(() => createEmployeeSchema.parse(withoutName)).toThrow();
  });

  it("rejects name shorter than 2 characters", () => {
    expect(() => createEmployeeSchema.parse({ ...valid, name: "A" })).toThrow();
  });

  it("rejects missing email", () => {
    const { email, ...withoutEmail } = valid;
    expect(() => createEmployeeSchema.parse(withoutEmail)).toThrow();
  });

  it("rejects invalid email format", () => {
    expect(() => createEmployeeSchema.parse({ ...valid, email: "not-email" })).toThrow();
  });

  it("rejects missing role", () => {
    const { role, ...withoutRole } = valid;
    expect(() => createEmployeeSchema.parse(withoutRole)).toThrow();
  });

  it('rejects status other than "Active" or "Inactive"', () => {
    expect(() => createEmployeeSchema.parse({ ...valid, status: "Pending" })).toThrow();
  });

  it("rejects invalid joinedDate format (not YYYY-MM-DD)", () => {
    expect(() =>
      createEmployeeSchema.parse({ ...valid, joinedDate: "15-01-2024" })
    ).toThrow();
  });

  it("rejects negative salary", () => {
    expect(() =>
      createEmployeeSchema.parse({ ...valid, salary: -100 })
    ).toThrow();
  });

  it("accepts salary of zero", () => {
    expect(() =>
      createEmployeeSchema.parse({ ...valid, salary: 0 })
    ).not.toThrow();
  });
});

// update employee data checks

describe("updateEmployeeSchema", () => {
  it("passes with a single valid field", () => {
    expect(() => updateEmployeeSchema.parse({ name: "Updated" })).not.toThrow();
  });

  it("fails when body is empty (no fields)", () => {
    expect(() => updateEmployeeSchema.parse({})).toThrow();
  });

  it("rejects invalid status in update", () => {
    expect(() => updateEmployeeSchema.parse({ status: "Maybe" })).toThrow();
  });

  it("accepts partial updates", () => {
    const result = updateEmployeeSchema.parse({ status: "Inactive", department: "HR" });
    expect(result.status).toBe("Inactive");
    expect(result.department).toBe("HR");
  });
});

// search query checks

describe("employeeQuerySchema", () => {
  it("applies all defaults when called with empty object", () => {
    const result = employeeQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.sortBy).toBe("joinedDate");
    expect(result.sortOrder).toBe("desc");
    expect(result.status).toBe("All");
    expect(result.search).toBe("");
    expect(result.department).toBe("");
  });

  it("coerces page string to integer", () => {
    const result = employeeQuerySchema.parse({ page: "3" });
    expect(result.page).toBe(3);
  });

  it("coerces limit string to integer", () => {
    const result = employeeQuerySchema.parse({ limit: "25" });
    expect(result.limit).toBe(25);
  });

  it("caps limit at 50", () => {
    const result = employeeQuerySchema.parse({ limit: "999" });
    expect(result.limit).toBe(50);
  });

  it("falls back to default 10 when limit is '0' (falsy after parseInt)", () => {
    const result = employeeQuerySchema.parse({ limit: "0" });
    expect(result.limit).toBe(10);
  });

  it("raises page minimum to 1", () => {
    const result = employeeQuerySchema.parse({ page: "-5" });
    expect(result.page).toBe(1);
  });

  it("rejects invalid sortBy field", () => {
    expect(() => employeeQuerySchema.parse({ sortBy: "salary" })).toThrow();
  });

  it("rejects invalid sortOrder value", () => {
    expect(() => employeeQuerySchema.parse({ sortOrder: "random" })).toThrow();
  });
});

// login checks

describe("loginSchema", () => {
  it("passes with valid email and password", () => {
    expect(() =>
      loginSchema.parse({ email: "user@test.com", password: "anything" })
    ).not.toThrow();
  });

  it("lowercases the email", () => {
    const result = loginSchema.parse({ email: "USER@TEST.COM", password: "x" });
    expect(result.email).toBe("user@test.com");
  });

  it("fails with invalid email", () => {
    expect(() =>
      loginSchema.parse({ email: "bad-email", password: "anything" })
    ).toThrow();
  });

  it("fails with empty password", () => {
    expect(() =>
      loginSchema.parse({ email: "user@test.com", password: "" })
    ).toThrow();
  });

  it("fails when email is missing", () => {
    expect(() => loginSchema.parse({ password: "anything" })).toThrow();
  });

  it("fails when password is missing", () => {
    expect(() => loginSchema.parse({ email: "user@test.com" })).toThrow();
  });
});

// register checks

describe("registerSchema", () => {
  const valid = {
    name: "Alice Smith",
    email: "alice@company.com",
    password: "Secret123",
  };

  it("passes with valid fields", () => {
    expect(() => registerSchema.parse(valid)).not.toThrow();
  });

  it('defaults role to "viewer" when omitted', () => {
    const result = registerSchema.parse(valid);
    expect(result.role).toBe("viewer");
  });

  it("accepts valid role values", () => {
    ["admin", "hr", "viewer"].forEach((role) => {
      expect(() => registerSchema.parse({ ...valid, role })).not.toThrow();
    });
  });

  it("rejects invalid role", () => {
    expect(() => registerSchema.parse({ ...valid, role: "superadmin" })).toThrow();
  });

  it("rejects password shorter than 8 characters", () => {
    expect(() => registerSchema.parse({ ...valid, password: "Ab1" })).toThrow();
  });

  it("rejects password without uppercase letter", () => {
    expect(() =>
      registerSchema.parse({ ...valid, password: "alllower9" })
    ).toThrow();
  });

  it("rejects password without a digit", () => {
    expect(() =>
      registerSchema.parse({ ...valid, password: "NoNumbers!" })
    ).toThrow();
  });

  it("rejects name shorter than 2 characters", () => {
    expect(() => registerSchema.parse({ ...valid, name: "A" })).toThrow();
  });

  it("rejects missing name", () => {
    const { name, ...withoutName } = valid;
    expect(() => registerSchema.parse(withoutName)).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      registerSchema.parse({ ...valid, email: "badformat" })
    ).toThrow();
  });
});
