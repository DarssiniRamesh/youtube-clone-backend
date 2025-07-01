const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const { User, Video, VideoLike, Comment, Subscription, View } = require('../src/sequelize');
const authRoutes = require('../src/routes/auth');
const adminRoutes = require('../src/routes/admin');
const userRoutes = require('../src/routes/user');
const videoRoutes = require('../src/routes/video');

/**
 * Helper to create a test Express app using a new in-memory db instance for isolation.
 * Disables logging and wires up all backend routes for full-stack API testing.
 */
async function createTestApp() {
  // Setup new in-memory Sequelize
  const sequelize = new Sequelize('sqlite::memory:', { logging: false });
  // Init models for this DB instance
  User.init(User.rawAttributes, { sequelize, modelName: 'User' });
  Video.init(Video.rawAttributes, { sequelize, modelName: 'Video' });
  VideoLike.init(VideoLike.rawAttributes, { sequelize, modelName: 'VideoLike' });
  Comment.init(Comment.rawAttributes, { sequelize, modelName: 'Comment' });
  Subscription.init(Subscription.rawAttributes, { sequelize, modelName: 'Subscription' });
  View.init(View.rawAttributes, { sequelize, modelName: 'View' });
  // Setup associations as in main sequelize.js:
  Video.belongsTo(User, { foreignKey: "userId" });
  User.belongsToMany(Video, { through: VideoLike, foreignKey: "userId" });
  Video.belongsToMany(User, { through: VideoLike, foreignKey: "videoId" });
  User.hasMany(Comment, { foreignKey: "userId" });
  Comment.belongsTo(User, { foreignKey: "userId" });
  Video.hasMany(Comment, { foreignKey: "videoId" });
  User.hasMany(Subscription, { foreignKey: "subscribeTo" });
  User.belongsToMany(Video, { through: View, foreignKey: "userId" });
  Video.belongsToMany(User, { through: View, foreignKey: "videoId" });

  await sequelize.sync({ force: true });

  // Build express app for testing (register all middlewares/routes)
  const app = express();
  app.use(bodyParser.json());
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/user', userRoutes);
  app.use('/api/v1/video', videoRoutes);

  // Error handler to capture thrown errors
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Unknown error' });
  });

  return { app, sequelize, models: { User, Video, VideoLike, Comment, Subscription, View } };
}

module.exports = { createTestApp };
