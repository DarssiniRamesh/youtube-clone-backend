const setupTestDB = require('./setupTestDB');
const VideoDef = require('../../../src/models/Video');

describe('Video Model', () => {
  let sequelize, Video;

  beforeAll(async () => {
    ({ sequelize, models: { Video } } = setupTestDB({ Video: VideoDef }));
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // PUBLIC_INTERFACE
  test('creates a Video with all required fields', async () => {
    const video = await Video.create({
      title: 'Test Video',
      url: 'https://test-vid.url/video.mp4',
      thumbnail: 'https://test-vid.url/thumbnail.jpg'
    });
    expect(video.id).toBeDefined();
    expect(video.title).toBe('Test Video');
    expect(video.url).toContain('http');
  });

  // PUBLIC_INTERFACE
  test('enforces required fields', async () => {
    await expect(Video.create({ url: 'url', thumbnail: 'thumb.jpg' }))
      .rejects.toThrow();
    await expect(Video.create({ title: 'MissingURL', thumbnail: 'thumb.jpg' }))
      .rejects.toThrow();
    await expect(Video.create({ title: 'MissingThumb', url: 'url' }))
      .rejects.toThrow();
  });

  // PUBLIC_INTERFACE
  test('can update and delete a video', async () => {
    const video = await Video.create({
      title: 'Title',
      url: 'https://url',
      thumbnail: 'https://thumb'
    });
    video.title = 'Updated Title';
    await video.save();
    expect((await Video.findByPk(video.id)).title).toBe('Updated Title');
    await video.destroy();
    expect(await Video.findByPk(video.id)).toBeNull();
  });
});
