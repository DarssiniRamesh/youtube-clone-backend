const { getUsers, removeUser, removeVideo, getVideos } = require('../../../src/controllers/admin');
const { User, Video } = require('../../../src/sequelize');

jest.mock('../../../src/sequelize');

describe('Admin Controller Unit Tests', () => {
  let req, res, next;
  beforeEach(() => {
    req = { body: {}, params: {}, user: { id: 1, username: "admin" } };
    res = { status: jest.fn(() => res), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('returns list of users', async () => {
      User.findAll.mockResolvedValue([{}]);
      await getUsers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('removeUser', () => {
    it('removes a user by username', async () => {
      req.params.username = "xuser";
      User.destroy.mockResolvedValue(1);
      await removeUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('removeVideo', () => {
    it('removes a video by ID', async () => {
      req.params.id = 22;
      Video.destroy.mockResolvedValue(1);
      await removeVideo(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getVideos', () => {
    it('returns list of videos', async () => {
      Video.findAll.mockResolvedValue([{}]);
      await getVideos(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
