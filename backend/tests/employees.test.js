const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');

describe('Employees API', () => {
  afterAll(async () => {
    // Close the DB connection so Jest can exit cleanly
    await mongoose.connection.close();
  });

  it('should return 200 OK for GET /api/employees', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
