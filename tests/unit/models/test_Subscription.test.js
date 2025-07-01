const setupTestDB = require('./setupTestDB');
const SubscriptionDef = require('../../../src/models/Subscription');

describe('Subscription Model', () => {
  let sequelize, Subscription;

  beforeAll(async () => {
    ({ sequelize, models: { Subscription } } = setupTestDB({ Subscription: SubscriptionDef }));
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // PUBLIC_INTERFACE
  test('creates a Subscription', async () => {
    const sub = await Subscription.create({ subscriber: '550e8400-e29b-41d4-a716-446655440000' });
    expect(sub.id).toBeDefined();
    expect(sub.subscriber).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  // PUBLIC_INTERFACE
  test('requires subscriber', async () => {
    await expect(Subscription.create({})).rejects.toThrow();
  });

  // PUBLIC_INTERFACE
  test('can update and delete a Subscription', async () => {
    const sub = await Subscription.create({ subscriber: '123e4567-e89b-12d3-a456-426614174000' });
    sub.subscriber = '321e4567-e89b-12d3-a456-426614174001';
    await sub.save();
    expect((await Subscription.findByPk(sub.id)).subscriber).toBe('321e4567-e89b-12d3-a456-426614174001');
    await sub.destroy();
    expect(await Subscription.findByPk(sub.id)).toBeNull();
  });
});
