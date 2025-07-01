const setupTestDB = require('./setupTestDB');
const CommentDef = require('../../../src/models/Comment');

describe('Comment Model', () => {
  let sequelize, Comment;

  beforeAll(async () => {
    ({ sequelize, models: { Comment } } = setupTestDB({ Comment: CommentDef }));
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // PUBLIC_INTERFACE
  test('creates a Comment with text', async () => {
    const comment = await Comment.create({ text: 'Test comment' });
    expect(comment.id).toBeDefined();
    expect(comment.text).toBe('Test comment');
  });

  // PUBLIC_INTERFACE
  test('requires text', async () => {
    await expect(Comment.create({})).rejects.toThrow();
  });

  // PUBLIC_INTERFACE
  test('can update and delete a Comment', async () => {
    const comment = await Comment.create({ text: 'Updatable' });
    comment.text = 'Updated!';
    await comment.save();
    expect((await Comment.findByPk(comment.id)).text).toBe('Updated!');
    await comment.destroy();
    expect(await Comment.findByPk(comment.id)).toBeNull();
  });
});
