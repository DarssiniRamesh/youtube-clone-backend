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

    // Setup: login user to get token (assume /api/v1/auth/login exists), or mock token injection here
    // Use a valid token for positive/negative edge case simulation (pseudocode below):
    // const loginResp = await request(app).post('/api/v1/auth/login').send({ email: 'test@email.com', password: 'pw' });
    // const token = loginResp.body.data.token;
    // resp = await request(app).put('/api/v1/user/').set('Authorization', `Bearer ${token}`).send({ firstname: "" });
    // expect(resp.statusCode).toBe(400 or 422);
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
