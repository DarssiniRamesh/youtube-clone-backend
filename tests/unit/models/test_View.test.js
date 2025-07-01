const setupTestDB = require('./setupTestDB');
const ViewDef = require('../../../src/models/View');

describe('View Model', () => {
  let sequelize, View;

  beforeAll(async () => {
    ({ sequelize, models: { View } } = setupTestDB({ View: ViewDef }));
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // PUBLIC_INTERFACE
  test('creates a View', async () => {
    const view = await View.create();
    expect(view.id).toBeDefined();
  });

  // PUBLIC_INTERFACE
  test('can delete a View', async () => {
    const view = await View.create();
    const id = view.id;
    await view.destroy();
    expect(await View.findByPk(id)).toBeNull();
  });
});
