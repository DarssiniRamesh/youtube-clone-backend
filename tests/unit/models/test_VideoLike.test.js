const setupTestDB = require('./setupTestDB');
const VideoLikeDef = require('../../../src/models/VideoLike');

describe('VideoLike Model', () => {
  let sequelize, VideoLike;

  beforeAll(async () => {
    ({ sequelize, models: { VideoLike } } = setupTestDB({ VideoLike: VideoLikeDef }));
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // PUBLIC_INTERFACE
  test('creates a VideoLike', async () => {
    const vlike = await VideoLike.create({ like: 1 });
    expect(vlike.like).toBe(1);
    expect(vlike.id).toBeDefined();
  });

  // PUBLIC_INTERFACE
  test('requires the "like" field', async () => {
    await expect(VideoLike.create({})).rejects.toThrow();
  });

  // PUBLIC_INTERFACE
  test('can update and delete VideoLike', async () => {
    const vlike = await VideoLike.create({ like: -1 });
    vlike.like = 1;
    await vlike.save();
    expect((await VideoLike.findByPk(vlike.id)).like).toBe(1);
    await vlike.destroy();
    expect(await VideoLike.findByPk(vlike.id)).toBeNull();
  });
});
