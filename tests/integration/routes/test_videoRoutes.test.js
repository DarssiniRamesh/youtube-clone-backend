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
    const resp = await request(app).post('/api/v1/video/').send({ title: "Test Video", url: "fake.mp4" });
    expect(resp.statusCode).toBe(401);
  });

  test('GET /api/v1/video/search needs auth', async () => {
    const resp = await request(app).get('/api/v1/video/search?searchterm=foo');
    expect(resp.statusCode).toBe(401);
  });

  test('GET /api/v1/video/:id needs auth', async () => {
    const resp = await request(app).get('/api/v1/video/23');
    expect([401,404]).toContain(resp.statusCode);
  });
});
