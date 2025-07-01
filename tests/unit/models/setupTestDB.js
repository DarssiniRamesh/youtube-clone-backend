const { Sequelize, DataTypes } = require('sequelize');

/**
 * Initializes a Sequelize instance using SQLite (in memory) for isolated model testing.
 * Returns an object mapping model names to instances and the sequelize instance for teardown.
 */
function setupTestDB(models) {
  const sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
  });

  const initializedModels = {};
  // Each models.<Model> is a required function(sequelize, DataTypes)
  for (const [modelName, def] of Object.entries(models)) {
    initializedModels[modelName] = def(sequelize, DataTypes);
  }

  return { sequelize, models: initializedModels };
}

module.exports = setupTestDB;
