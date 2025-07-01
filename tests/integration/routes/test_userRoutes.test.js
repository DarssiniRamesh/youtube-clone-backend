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
    expect(true).toBe(true); // Place-holder; token logic/middleware mocking not implemented in this integration skeleton.
  });

  test('GET /api/v1/user/likedVideos', async () => {
    const resp = await request(app).get('/api/v1/user/likedVideos');
    expect(resp.statusCode).toBe(401);
  });

  test('GET /api/v1/user/history', async () => {
    const resp = await request(app).get('/api/v1/user/history');
    expect(resp.statusCode).toBe(401);
  });
});
