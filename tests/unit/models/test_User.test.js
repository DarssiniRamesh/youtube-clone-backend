const setupTestDB = require('./setupTestDB');
const UserDef = require('../../../src/models/User');

describe('User Model', () => {
  let sequelize, User;

  beforeAll(async () => {
    ({ sequelize, models: { User } } = setupTestDB({ User: UserDef }));
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // PUBLIC_INTERFACE
  test('creates a User with mandatory fields', async () => {
    const user = await User.create({
      firstname: 'Jane',
      lastname: 'Doe',
      username: 'janedoe',
      email: 'jane@example.com',
      password: 'password123'
    });
    expect(user.id).toBeDefined();
    expect(user.firstname).toBe('Jane');
    expect(user.avatar).toMatch(/^https?:\/\//);
    expect(user.isAdmin).toBe(false);
  });

  // PUBLIC_INTERFACE
  test('enforces email uniqueness', async () => {
    await User.create({
      firstname: 'John',
      lastname: 'Smith',
      username: 'johnsmith',
      email: 'unique@example.com',
      password: 'password123'
    });
    await expect(User.create({
      firstname: 'John2',
      lastname: 'Smith2',
      username: 'johnsmith2',
      email: 'unique@example.com',
      password: 'password123'
    })).rejects.toThrow();
  });

  // PUBLIC_INTERFACE
  test('requires all mandatory fields', async () => {
    await expect(User.create({
      lastname: 'MissingFirst',
      username: 'missingfirst',
      email: 'missing@example.com',
      password: 'password123'
    })).rejects.toThrow();
    await expect(User.create({
      firstname: 'MissingLast',
      username: 'missinglast',
      email: 'missing2@example.com',
      password: 'password123'
    })).rejects.toThrow();
    await expect(User.create({
      firstname: 'MissingUser',
      lastname: 'MissingUser',
      email: 'missing3@example.com',
      password: 'password123'
    })).rejects.toThrow();
    await expect(User.create({
      firstname: 'MissingEmail',
      lastname: 'MissingEmail',
      username: 'missingemail',
      password: 'password123'
    })).rejects.toThrow();
    await expect(User.create({
      firstname: 'ShortPass',
      lastname: 'ShortPass',
      username: 'shortpass',
      email: 'short@example.com',
      password: null
    })).rejects.toThrow();
  });

  // PUBLIC_INTERFACE
  test('validates email format', async () => {
    await expect(User.create({
      firstname: 'Invalid',
      lastname: 'Email',
      username: 'invalidemail',
      email: 'not-an-email',
      password: 'password123'
    })).rejects.toThrow();
  });

  // PUBLIC_INTERFACE
  test('applies default values for avatar, cover, isAdmin', async () => {
    const user = await User.create({
      firstname: 'Default',
      lastname: 'Defaults',
      username: 'defaultsuser',
      email: 'default@example.com',
      password: 'password123'
    });
    expect(user.avatar).toMatch(/^https?:\/\//);
    expect(user.cover).toMatch(/^https?:\/\//);
    expect(user.isAdmin).toBe(false);
  });

  // PUBLIC_INTERFACE
  test('updates user details', async () => {
    const user = await User.create({
      firstname: 'Update',
      lastname: 'Me',
      username: 'updateme',
      email: 'update@example.com',
      password: 'password123'
    });
    user.lastname = 'Changed';
    await user.save();
    const found = await User.findByPk(user.id);
    expect(found.lastname).toBe('Changed');
  });

  // PUBLIC_INTERFACE
  test('deletes a user record', async () => {
    const user = await User.create({
      firstname: 'Delete',
      lastname: 'Me',
      username: 'deleteme',
      email: 'delete@example.com',
      password: 'password123'
    });
    const id = user.id;
    await user.destroy();
    const gone = await User.findByPk(id);
    expect(gone).toBeNull();
  });
});
