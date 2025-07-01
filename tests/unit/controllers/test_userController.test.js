const { 
  toggleSubscribe, getFeed, editUser,
  searchUser, getProfile, recommendChannels,
  getLikedVideos, getHistory 
} = require('../../../src/controllers/user');
const { User, Subscription, Video, VideoLike, View } = require('../../../src/sequelize');

jest.mock('../../../src/sequelize');

describe('User Controller Unit Tests', () => {
  let req, res, next;
  beforeEach(() => {
    req = { body: {}, user: { id: 1, avatar: "a", username: "test" }, params: {}, query: {} };
    res = { status: jest.fn(() => res), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('toggleSubscribe', () => {
    it('should not allow subscribing to self', async () => {
      req.params.id = 1;
      await toggleSubscribe(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 400 }));
    });

    it('should return 404 if target user does not exist', async () => {
      req.user.id = 2;
      req.params.id = 5;
      User.findByPk.mockResolvedValue(null);
      await toggleSubscribe(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 404 }));
    });

    it('should handle exception in User.findByPk gracefully', async () => {
      req.user.id = 2; req.params.id = 5;
      User.findByPk.mockRejectedValue(new Error('DB error'));
      await toggleSubscribe(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should handle exception in Subscription.findOne gracefully', async () => {
      req.user.id = 2; req.params.id = 3;
      User.findByPk.mockResolvedValue({});
      Subscription.findOne.mockRejectedValue(new Error('DB error'));
      await toggleSubscribe(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should subscribe if not subscribed yet', async () => {
      req.user.id = 2; req.params.id = 3;
      User.findByPk.mockResolvedValue({});
      Subscription.findOne.mockResolvedValue(null);
      Subscription.create.mockResolvedValue({});
      await toggleSubscribe(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle error during Subscription.create gracefully', async () => {
      req.user.id = 2; req.params.id = 3;
      User.findByPk.mockResolvedValue({});
      Subscription.findOne.mockResolvedValue(null);
      Subscription.create.mockRejectedValue(new Error('DB error'));
      await toggleSubscribe(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should unsubscribe if already subscribed', async () => {
      req.user.id = 2; req.params.id = 3;
      User.findByPk.mockResolvedValue({});
      Subscription.findOne.mockResolvedValue({});
      Subscription.destroy.mockResolvedValue({});
      await toggleSubscribe(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle error during Subscription.destroy gracefully', async () => {
      req.user.id = 2; req.params.id = 3;
      User.findByPk.mockResolvedValue({});
      Subscription.findOne.mockResolvedValue({});
      Subscription.destroy.mockRejectedValue(new Error('DB error'));
      await toggleSubscribe(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('editUser', () => {
    it('edits user and returns new data', async () => {
      User.update.mockResolvedValue([1]);
      User.findByPk.mockResolvedValue({ id: 1 });
      req.user.id = 1;
      await editUser(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 1 } });
    });

    it('throws error if update fails', async () => {
      User.update.mockRejectedValue(new Error('DB error'));
      await editUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('throws error if findByPk fails after update', async () => {
      User.update.mockResolvedValue([1]);
      User.findByPk.mockRejectedValue(new Error('DB error'));
      await editUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('handles missing required update field (e.g., username)', async () => {
      User.update.mockRejectedValue({
        errors: [{ message: 'username cannot be null', path: 'username' }]
      });
      await editUser(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getFeed', () => {
    it('returns video feed when subscription exists', async () => {
      Subscription.findAll.mockResolvedValue([{ subscribeTo: 2 }]);
      Video.findAll.mockResolvedValue([{ id: 5, setDataValue: jest.fn() }]);
      View.count.mockResolvedValue(0);
      req.user.id = 1;
      await getFeed(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('searchUser', () => {
    it('returns 400 if search term missing', async () => {
      req.query.searchterm = undefined;
      await searchUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 400 }));
    });

    it('handles DB error in User.findAll gracefully', async () => {
      req.query.searchterm = "bob";
      User.findAll.mockRejectedValue(new Error('Database unavailable'));
      await searchUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('handles no users found', async () => {
      req.query.searchterm = "bob";
      User.findAll.mockResolvedValue([]);
      await searchUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('handles DB errors in Subscription.count gracefully', async () => {
      req.query.searchterm = "bob";
      User.findAll.mockResolvedValue([{ id: 2, setDataValue: jest.fn() }]);
      Subscription.count.mockRejectedValue(new Error('DB error'));
      await searchUser(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('handles DB errors in Video.count gracefully', async () => {
      req.query.searchterm = "bob";
      User.findAll.mockResolvedValue([{ id: 2, setDataValue: jest.fn() }]);
      Subscription.count.mockResolvedValue(1);
      Video.count.mockRejectedValue(new Error('DB error'));
      await searchUser(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('returns found users with correct shape', async () => {
      req.query.searchterm = "bob";
      User.findAll.mockResolvedValue([{ id: 2, setDataValue: jest.fn() }]);
      Subscription.count.mockResolvedValue(2);
      Video.count.mockResolvedValue(3);
      Subscription.findOne.mockResolvedValue(null);
      req.user.id = 4;
      await searchUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('handles error in Subscription.findOne', async () => {
      req.query.searchterm = "bob";
      User.findAll.mockResolvedValue([{ id: 2, setDataValue: jest.fn() }]);
      Subscription.count.mockResolvedValue(2);
      Video.count.mockResolvedValue(3);
      Subscription.findOne.mockRejectedValue(new Error("DB error"));
      req.user.id = 4;
      await searchUser(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('returns 404 for missing user', async () => {
      req.params.id = 999;
      User.findByPk.mockResolvedValue(null);
      await getProfile(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 404 }));
    });

    it('handles DB error during User.findByPk', async () => {
      req.params.id = 1000;
      User.findByPk.mockRejectedValue(new Error("Error finding user"));
      await getProfile(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('handles DB error in Subscription.count', async () => {
      req.params.id = 50;
      User.findByPk.mockResolvedValue({ setDataValue: jest.fn() });
      Subscription.count.mockRejectedValue(new Error("DB fail"));
      req.user.id = 2;
      await getProfile(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('handles DB error in Subscription.findOne', async () => {
      req.params.id = 12;
      User.findByPk.mockResolvedValue({ setDataValue: jest.fn() });
      Subscription.count.mockResolvedValue(2);
      Subscription.findOne.mockRejectedValue(new Error("DB error"));
      req.user.id = 2;
      await getProfile(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('handles DB error in Video.findAll', async () => {
      req.user.id = 1; req.params.id = 2;
      const userObj = { setDataValue: jest.fn() };
      User.findByPk.mockResolvedValue(userObj);
      Subscription.count.mockResolvedValue(2);
      Subscription.findOne.mockResolvedValue(null);
      Subscription.findAll.mockResolvedValue([]);
      User.findAll.mockResolvedValue([]);
      Video.findAll.mockRejectedValue(new Error('DB error'));
      await getProfile(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('returns user profile', async () => {
      req.user.id = 1; req.params.id = 2;
      const userObj = { setDataValue: jest.fn() };
      User.findByPk.mockResolvedValue(userObj);
      Subscription.count.mockResolvedValue(2);
      Subscription.findOne.mockResolvedValue(null);
      Subscription.findAll.mockResolvedValue([]);
      User.findAll.mockResolvedValue([]);
      Video.findAll.mockResolvedValue([]);
      await getProfile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('recommendChannels', () => {
    it('handles empty channel list', async () => {
      User.findAll.mockResolvedValue([]);
      await recommendChannels(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns recommended channels', async () => {
      User.findAll.mockResolvedValue([{ id: 2, setDataValue: jest.fn() }]);
      Subscription.count.mockResolvedValue(1);
      Subscription.findOne.mockResolvedValue(null);
      Video.count.mockResolvedValue(1);
      req.user.id = 1;
      await recommendChannels(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getLikedVideos', () => {
    it('delegates to getVideos helper - happy path', async () => {
      // We don't directly test getVideos() because it's internal/private,
      // but verify getLikedVideos/res.status still responds.
      VideoLike.findAll.mockResolvedValue([]);
      Video.findAll.mockResolvedValue([]);
      await getLikedVideos(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getHistory', () => {
    it('delegates to getVideos helper - no videos', async () => {
      View.findAll.mockResolvedValue([]);
      Video.findAll.mockResolvedValue([]);
      await getHistory(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
