const request = require('supertest');
const { createTestApp } = require('../../testUtils');

describe('User Routes Integration', () => {
  let app, sequelize, user;
  beforeAll(async () => {
    const res = await createTestApp();
    app = res.app;
    sequelize = res.sequelize;
    user = await res.models.User.create({
      email: 'test@email.com',
      password: 'pw', username: 'test', firstname: 'T', lastname: 'T'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('GET /api/v1/user/feed should 401 without token', async () => {
    const resp = await request(app).get('/api/v1/user/feed');
    expect(resp.statusCode).toBe(401);
  });

  test('GET /api/v1/user/search needs token (401)', async () => {
    const resp = await request(app).get('/api/v1/user/search?searchterm=test');
    expect(resp.statusCode).toBe(401);
  });

  test('PUT /api/v1/user/ (edit user)', async () => {
    // Negative test: no token
    let resp = await request(app).put('/api/v1/user/').send({ firstname: "NewName" });
    expect(resp.statusCode).toBe(401);

    // Authenticated positive & validation edge
    const loginResp = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@email.com', password: 'pw' });
    expect(loginResp.statusCode).toBe(200);
    const token = loginResp.body.data;
    // Valid
    resp = await request(app).put('/api/v1/user/')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstname: "NewName" });
    expect([200, 201]).toContain(resp.statusCode);

    // Invalid payload (missing required field)
    resp = await request(app).put('/api/v1/user/')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: null, firstname: "Should Fail" });
    expect([400, 422, 500]).toContain(resp.statusCode);
  });

  test('GET /api/v1/user/likedVideos - forbidden/edge cases', async () => {
    // Unauthenticated
    const resp = await request(app).get('/api/v1/user/likedVideos');
    expect(resp.statusCode).toBe(401);
    // ...auth/malformed/empty state logic would follow here
  });

  test('GET /api/v1/user/history edge', async () => {
    const resp = await request(app).get('/api/v1/user/history');
    expect(resp.statusCode).toBe(401);
    // ...more happy/bad path with token in full implementation context
  });

  // Additional: test subscribe toggle route requires auth, valid params, etc.
  test('GET /api/v1/user/1/togglesubscribe needs token (401)', async () => {
    const resp = await request(app).get('/api/v1/user/1/togglesubscribe');
    expect(resp.statusCode).toBe(401);
  });

  // Edge/negative: test GET /api/v1/user/search - empty param
  test('GET /api/v1/user/search?searchterm= needs auth', async () => {
    const resp = await request(app).get('/api/v1/user/search?searchterm=');
    expect(resp.statusCode).toBe(401);
  });

  // ...more cases for /profile, /feed, recommendChannels, error/fake IDs, etc.

  test('GET /api/v1/user/likedVideos', async () => {
    const resp = await request(app).get('/api/v1/user/likedVideos');
    expect(resp.statusCode).toBe(401);
  });

  test('GET /api/v1/user/history', async () => {
    const resp = await request(app).get('/api/v1/user/history');
    expect(resp.statusCode).toBe(401);
  });
});
