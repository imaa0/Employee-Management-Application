const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/index");
const { User } = require("../src/lib/db");

// test helpers

const makeUser = (overrides = {}) => ({
  name: "Test User",
  email: `user-${Date.now()}-${Math.random().toString(36).slice(2)}@workmate.com`,
  password: "Secret123",
  role: "viewer",
  ...overrides,
});

// setup and teardown

let createdEmails = [];

afterAll(async () => {
  if (createdEmails.length > 0) {
    await User.deleteMany({ email: { $in: createdEmails } });
  }
  await mongoose.connection.close();
});

// test register endpoint

describe("POST /api/auth/register", () => {
  it("creates a new user and returns token + user object", async () => {
    const payload = makeUser();
    const res = await request(app).post("/api/auth/register").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(payload.email);
    expect(res.body.data.user.role).toBe("viewer");
    expect(res.body.data.user.password).toBeUndefined(); // never expose hash
    createdEmails.push(payload.email);
  });

  it("does not expose password hash in response", async () => {
    const payload = makeUser();
    const res = await request(app).post("/api/auth/register").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.user).not.toHaveProperty("password");
    createdEmails.push(payload.email);
  });

  it("returns 409 on duplicate email", async () => {
    const payload = makeUser();
    const first = await request(app).post("/api/auth/register").send(payload);
    expect(first.statusCode).toBe(201);
    createdEmails.push(payload.email);

    const second = await request(app).post("/api/auth/register").send(payload);
    expect(second.statusCode).toBe(409);
    expect(second.body.success).toBe(false);
  });

  it("returns 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(makeUser({ email: "not-valid" }));
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Validation failed");
  });

  it("returns 400 when password is too short (< 8 chars)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(makeUser({ password: "Ab1" }));
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when password has no uppercase letter", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(makeUser({ password: "nosecret1" }));
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when password has no digit", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(makeUser({ password: "NoDigitHere" }));
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when name is missing", async () => {
    const payload = makeUser();
    delete payload.name;
    const res = await request(app).post("/api/auth/register").send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// test login endpoint

describe("POST /api/auth/login", () => {
  let registeredEmail;
  const password = "Secret123";

  beforeAll(async () => {
    const payload = makeUser({ password });
    const res = await request(app).post("/api/auth/register").send(payload);
    registeredEmail = payload.email;
    createdEmails.push(registeredEmail);
  });

  it("returns 200 with token and user on valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: registeredEmail, password });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(registeredEmail);
  });

  it("JWT token is a valid 3-part string", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: registeredEmail, password });
    const parts = res.body.data.token.split(".");
    expect(parts).toHaveLength(3);
  });

  it("returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: registeredEmail, password: "WrongPass9" });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it("returns 401 for non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@nobody.com", password: "Secret123" });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "Secret123" });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: registeredEmail });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// test update profile (needs auth)

describe("PUT /api/auth/profile", () => {
  let token;

  beforeAll(async () => {
    const payload = makeUser();
    const res = await request(app).post("/api/auth/register").send(payload);
    token = res.body.data.token;
    createdEmails.push(payload.email);
  });

  it("updates profile and returns a new token", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name", phone: "555-1234", location: "Mumbai" });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe("Updated Name");
    expect(res.body.data.token).toBeDefined(); // fresh token returned
  });

  it("returns 401 without Authorization header", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .send({ name: "No Auth" });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 with an invalid token", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", "Bearer this.is.garbage")
      .send({ name: "Bad Token" });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// test update password (needs auth)

describe("PUT /api/auth/password", () => {
  let token;
  const originalPassword = "Secret123";

  beforeAll(async () => {
    const payload = makeUser({ password: originalPassword });
    const res = await request(app).post("/api/auth/register").send(payload);
    token = res.body.data.token;
    createdEmails.push(payload.email);
  });

  it("returns 200 on correct current password", async () => {
    const res = await request(app)
      .put("/api/auth/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: originalPassword, newPassword: "NewSecret9" });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/updated/i);
  });

  it("returns 401 on wrong current password", async () => {
    const res = await request(app)
      .put("/api/auth/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "WrongOld1", newPassword: "NewSecret9" });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app)
      .put("/api/auth/password")
      .send({ currentPassword: originalPassword, newPassword: "NewSecret9" });
    expect(res.statusCode).toBe(401);
  });
});
