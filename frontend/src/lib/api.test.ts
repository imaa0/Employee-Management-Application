import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  setToken,
  clearToken,
  setUser,
  getUser,
  getEmployeesAPI,
  createEmployeeAPI,
  updateEmployeeAPI,
  deleteEmployeeAPI,
  loginAPI,
  registerAPI,
} from "@/lib/api";

// test helpers

function mockFetch(body: object, ok = true, status = 200) {
  return vi.fn().mockResolvedValueOnce({
    ok,
    status,
    json: async () => body,
  });
}

// test local storage

describe("Token & User helpers", () => {
  beforeEach(() => localStorage.clear());

  it("setToken stores value under ems_token", () => {
    setToken("abc.def.ghi");
    expect(localStorage.getItem("ems_token")).toBe("abc.def.ghi");
  });

  it("clearToken removes both ems_token and ems_user", () => {
    localStorage.setItem("ems_token", "tok");
    localStorage.setItem("ems_user", '{"id":"1"}');
    clearToken();
    expect(localStorage.getItem("ems_token")).toBeNull();
    expect(localStorage.getItem("ems_user")).toBeNull();
  });

  it("setUser serializes user object to JSON", () => {
    const user = { id: "1", name: "Alice", email: "a@b.com", role: "admin" };
    setUser(user);
    expect(JSON.parse(localStorage.getItem("ems_user")!)).toEqual(user);
  });

  it("getUser deserializes the stored user", () => {
    const user = { id: "1", name: "Alice", email: "a@b.com", role: "admin" };
    localStorage.setItem("ems_user", JSON.stringify(user));
    expect(getUser()).toEqual(user);
  });

  it("getUser returns null when nothing is stored", () => {
    expect(getUser()).toBeNull();
  });
});

// test login auth

describe("loginAPI", () => {
  afterEach(() => vi.restoreAllMocks());

  it("makes a POST request to /auth/login and returns data", async () => {
    const mockResponse = {
      success: true,
      message: "Login successful",
      data: { token: "t.o.k", user: { id: "1", name: "Alice" } },
    };
    vi.stubGlobal("fetch", mockFetch(mockResponse));

    const result = await loginAPI({ email: "a@b.com", password: "Secret1" });
    expect(result).toEqual(mockResponse);

    const [url, opts] = (fetch as any).mock.calls[0];
    expect(url).toContain("/auth/login");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ email: "a@b.com", password: "Secret1" });
  });

  it("throws when server returns an error", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ error: "Invalid email or password" }, false, 401)
    );
    await expect(loginAPI({ email: "x@x.com", password: "bad" })).rejects.toThrow(
      "Invalid email or password"
    );
  });
});

// test registerauth

describe("registerAPI", () => {
  afterEach(() => vi.restoreAllMocks());

  it("makes a POST to /auth/register", async () => {
    const mockResponse = {
      success: true,
      message: "Account created successfully",
      data: { token: "x.y.z", user: { id: "2", name: "Bob" } },
    };
    vi.stubGlobal("fetch", mockFetch(mockResponse, true, 201));

    const result = await registerAPI({
      name: "Bob",
      email: "bob@test.com",
      password: "Secret1",
    });
    expect(result).toEqual(mockResponse);

    const [url] = (fetch as any).mock.calls[0];
    expect(url).toContain("/auth/register");
  });

  it("throws on 409 conflict", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ error: "An account with this email already exists" }, false, 409)
    );
    await expect(
      registerAPI({ name: "Bob", email: "bob@test.com", password: "Secret1" })
    ).rejects.toThrow("An account with this email already exists");
  });
});

// get employees

describe("getEmployeesAPI", () => {
  afterEach(() => vi.restoreAllMocks());

  const successResponse = {
    success: true,
    data: [],
    pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1, hasNext: false, hasPrev: false },
    stats: { total: 0, active: 0, inactive: 0 },
  };

  it("makes a GET request to /employees", async () => {
    vi.stubGlobal("fetch", mockFetch(successResponse));
    await getEmployeesAPI();
    const [url] = (fetch as any).mock.calls[0];
    expect(url).toContain("/employees");
  });

  it("appends search query param when provided", async () => {
    vi.stubGlobal("fetch", mockFetch(successResponse));
    await getEmployeesAPI({ search: "Alice" });
    const [url] = (fetch as any).mock.calls[0];
    expect(url).toContain("search=Alice");
  });

  it("appends status query param", async () => {
    vi.stubGlobal("fetch", mockFetch(successResponse));
    await getEmployeesAPI({ status: "Active" });
    const [url] = (fetch as any).mock.calls[0];
    expect(url).toContain("status=Active");
  });

  it("appends page and limit params", async () => {
    vi.stubGlobal("fetch", mockFetch(successResponse));
    await getEmployeesAPI({ page: 2, limit: 20 });
    const [url] = (fetch as any).mock.calls[0];
    expect(url).toContain("page=2");
    expect(url).toContain("limit=20");
  });

  it("throws when the request fails", async () => {
    vi.stubGlobal("fetch", mockFetch({ error: "Database unavailable" }, false, 503));
    await expect(getEmployeesAPI()).rejects.toThrow("Database unavailable");
  });
});

// add employee

describe("createEmployeeAPI", () => {
  afterEach(() => vi.restoreAllMocks());

  const newEmp = {
    name: "Charlie",
    email: "charlie@co.com",
    role: "Analyst",
    status: "Active" as const,
  };

  it("makes a POST to /employees with the payload", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ success: true, message: "Employee created successfully", data: { ...newEmp, id: "EMP-001" } }, true, 201)
    );
    const result = await createEmployeeAPI(newEmp);
    expect(result.success).toBe(true);
    const [url, opts] = (fetch as any).mock.calls[0];
    expect(url).toContain("/employees");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body).name).toBe("Charlie");
  });

  it("throws on server error", async () => {
    vi.stubGlobal("fetch", mockFetch({ error: "Validation failed" }, false, 400));
    await expect(createEmployeeAPI(newEmp)).rejects.toThrow("Validation failed");
  });
});

// update employee

describe("updateEmployeeAPI", () => {
  afterEach(() => vi.restoreAllMocks());

  it("makes a PUT to /employees/:id", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ success: true, message: "Employee updated successfully", data: {} })
    );
    await updateEmployeeAPI("EMP-001", { status: "Inactive" });
    const [url, opts] = (fetch as any).mock.calls[0];
    expect(url).toContain("/employees/EMP-001");
    expect(opts.method).toBe("PUT");
    expect(JSON.parse(opts.body)).toMatchObject({ status: "Inactive" });
  });

  it("throws 404 when employee not found", async () => {
    vi.stubGlobal("fetch", mockFetch({ error: "Employee not found" }, false, 404));
    await expect(updateEmployeeAPI("EMP-999", { name: "Ghost" })).rejects.toThrow(
      "Employee not found"
    );
  });
});

// delete employee

describe("deleteEmployeeAPI", () => {
  afterEach(() => vi.restoreAllMocks());

  it("makes a DELETE to /employees/:id", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ success: true, message: "Employee deleted successfully" })
    );
    const result = await deleteEmployeeAPI("EMP-001");
    expect(result.success).toBe(true);
    const [url, opts] = (fetch as any).mock.calls[0];
    expect(url).toContain("/employees/EMP-001");
    expect(opts.method).toBe("DELETE");
  });

  it("attaches Bearer token from localStorage if present", async () => {
    localStorage.setItem("ems_token", "my.jwt.token");
    vi.stubGlobal(
      "fetch",
      mockFetch({ success: true, message: "Employee deleted successfully" })
    );
    await deleteEmployeeAPI("EMP-001");
    const [, opts] = (fetch as any).mock.calls[0];
    expect(opts.headers["Authorization"]).toBe("Bearer my.jwt.token");
    localStorage.clear();
  });

  it("throws 404 when employee not found", async () => {
    vi.stubGlobal("fetch", mockFetch({ error: "Employee not found" }, false, 404));
    await expect(deleteEmployeeAPI("EMP-999")).rejects.toThrow("Employee not found");
  });
});
