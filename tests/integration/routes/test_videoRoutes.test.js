const request = require('supertest');
const { createTestApp } = require('../../testUtils');

describe('Video Routes Integration', () => {
  let app, sequelize, user;
  beforeAll(async () => {
    const res = await createTestApp();
    app = res.app;
    sequelize = res.sequelize;
    user = await res.models.User.create({
      email: 'foo@bar.com', password: 'pw', username: 'foo', firstname: 'F', lastname: 'B'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('GET /api/v1/video/ (recommendedVideos) is public', async () => {
    const resp = await request(app).get('/api/v1/video/');
    expect(resp.statusCode).toBe(200);
  });

  test('POST /api/v1/video/ needs auth', async () => {
    // Missing token yields 401
    let resp = await request(app).post('/api/v1/video/').send({ title: "Test Video", url: "fake.mp4" });
    expect(resp.statusCode).toBe(401);

    // Insert more tests for invalid payload structure (with auth) when fully mocking tokens
  });

  test('GET /api/v1/video/search needs auth', async () => {
    let resp = await request(app).get('/api/v1/video/search?searchterm=foo');
    expect(resp.statusCode).toBe(401);

    resp = await request(app).get('/api/v1/video/search');
    expect(resp.statusCode).toBe(401);
    // If token is provided but param missing/empty, expect 400 (applies in full token testbed)
  });

  test('GET /api/v1/video/:id needs auth', async () => {
    let resp = await request(app).get('/api/v1/video/23');
    expect([401,404]).toContain(resp.statusCode);
    // With valid (but non-existing video) token should trigger 404, etc.
  });

  // Extra: try requesting non-existent routes, or with malformed IDs, to ensure robust error handling.
});
