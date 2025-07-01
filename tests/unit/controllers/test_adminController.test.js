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
    it('handles DB errors gracefully', async () => {
      const error = new Error('DB down');
      User.findAll.mockRejectedValue(error);
      await getUsers(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('removeUser', () => {
    it('removes a user by username', async () => {
      req.params.username = "xuser";
      User.destroy.mockResolvedValue(1);
      await removeUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it('returns 404 if user not found', async () => {
      req.params.username = "missing";
      User.destroy.mockResolvedValue(0);
      await removeUser(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          statusCode: 404,
        })
      );
    });
    it('handles DB error for user removal', async () => {
      req.params.username = "xuser";
      User.destroy.mockRejectedValue(new Error('DB error'));
      await removeUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    it('calls next with error if username missing', async () => {
      req.params.username = undefined;
      await removeUser(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('removeVideo', () => {
    it('removes a video by ID', async () => {
      req.params.id = 22;
      Video.destroy.mockResolvedValue(1);
      await removeVideo(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it('returns 404 for non-existent video', async () => {
      req.params.id = 999;
      Video.destroy.mockResolvedValue(0);
      await removeVideo(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          statusCode: 404,
        })
      );
    });
    it('handles DB error on video removal', async () => {
      req.params.id = 11;
      Video.destroy.mockRejectedValue(new Error('DB err'));
      await removeVideo(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    it('calls next with error if id missing', async () => {
      req.params.id = undefined;
      await removeVideo(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getVideos', () => {
    it('returns list of videos', async () => {
      Video.findAll.mockResolvedValue([{}]);
      await getVideos(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    it('handles DB errors gracefully', async () => {
      Video.findAll.mockRejectedValue(new Error('DB error'));
      await getVideos(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
