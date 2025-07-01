const {
  newVideo, getVideo, likeVideo, dislikeVideo,
  addComment, newView, searchVideo
} = require('../../../src/controllers/video');
const { Video, User, VideoLike, Comment, View, Subscription } = require('../../../src/sequelize');

jest.mock('../../../src/sequelize');

describe('Video Controller Unit Tests', () => {
  let req, res, next;
  beforeEach(() => {
    req = { body: {}, user: { id: 1, avatar: "a", username: "x" }, params: {}, query: {} };
    res = { status: jest.fn(() => res), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('newVideo', () => {
    it('creates new video and returns it', async () => {
      Video.create.mockResolvedValue({ id: 1 });
      await newVideo(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 1 } });
    });
  });

  describe('getVideo', () => {
    it('returns 404 for missing video', async () => {
      req.params.id = 5;
      Video.findByPk.mockResolvedValue(null);
      await getVideo(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 404 }));
    });

    it('returns video with details if found', async () => {
      const video = { getComments: jest.fn(), setDataValue: jest.fn(), id: 1, userId: 2 };
      Video.findByPk.mockResolvedValue(video);
      video.getComments.mockResolvedValue([]);
      VideoLike.findOne.mockResolvedValue(null);
      Comment.count.mockResolvedValue(0);
      VideoLike.count.mockResolvedValue(0);
      View.count.mockResolvedValue(5);
      Subscription.findOne.mockResolvedValue(null);
      View.findOne.mockResolvedValue(null);
      Subscription.count.mockResolvedValue(1);
      req.user.id = 2;
      await getVideo(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('likeVideo', () => {
    it('returns 404 on missing video', async () => {
      Video.findByPk.mockResolvedValue(null);
      req.params.id = 2;
      await likeVideo(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 404 }));
    });

    it('likes new video, updates or removes like/dislike as needed', async () => {
      Video.findByPk.mockResolvedValue({});
      VideoLike.findOne.mockResolvedValueOnce(null);
      VideoLike.create.mockResolvedValue({});
      req.params.id = 2;
      await likeVideo(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: {} });
      // Removing like or flipping dislike to like:
      VideoLike.findOne.mockResolvedValueOnce({ destroy: jest.fn() });
      await likeVideo(req, res, next);
      VideoLike.findOne.mockResolvedValueOnce({ like: -1, save: jest.fn() });
      await likeVideo(req, res, next);
    });
  });

  describe('dislikeVideo', () => {
    it('returns 404 on missing video', async () => {
      Video.findByPk.mockResolvedValue(null);
      req.params.id = 2;
      await dislikeVideo(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 404 }));
    });

    it('dislikes video, updates/removes like/dislike as needed', async () => {
      Video.findByPk.mockResolvedValue({});
      VideoLike.findOne.mockResolvedValueOnce(null);
      VideoLike.create.mockResolvedValue({});
      req.params.id = 2;
      await dislikeVideo(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: {} });
      // Removing dislike or flipping like to dislike:
      VideoLike.findOne.mockResolvedValueOnce({ destroy: jest.fn() });
      await dislikeVideo(req, res, next);
      VideoLike.findOne.mockResolvedValueOnce({ like: 1, save: jest.fn() });
      await dislikeVideo(req, res, next);
    });
  });

  describe('addComment', () => {
    it('returns 404 on missing video', async () => {
      Video.findByPk.mockResolvedValue(null);
      req.params.id = 1;
      await addComment(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 404 }));
    });

    it('adds comment if video found', async () => {
      Video.findByPk.mockResolvedValue({});
      Comment.create.mockResolvedValue({ setDataValue: jest.fn() });
      req.params.id = 1;
      req.body.text = "Nice";
      await addComment(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('newView', () => {
    it('returns 404 on missing video', async () => {
      Video.findByPk.mockResolvedValue(null);
      req.params.id = 10;
      await newView(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 404 }));
    });

    it('returns 400 if already viewed', async () => {
      Video.findByPk.mockResolvedValue({});
      View.findOne.mockResolvedValue(true);
      req.params.id = 1;
      await newView(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 400 }));
    });

    it('creates new view if not viewed', async () => {
      Video.findByPk.mockResolvedValue({});
      View.findOne.mockResolvedValue(false);
      View.create.mockResolvedValue({});
      req.params.id = 1;
      await newView(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('searchVideo', () => {
    it('returns 400 if searchterm missing', async () => {
      req.query.searchterm = undefined;
      await searchVideo(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 400 }));
    });

    it('returns empty array for no videos', async () => {
      req.query.searchterm = "foo";
      Video.findAll.mockResolvedValue([]);
      await searchVideo(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns videos for valid query', async () => {
      req.query.searchterm = "foo";
      Video.findAll.mockResolvedValue([{ id: 1, setDataValue: jest.fn() }]);
      View.count.mockResolvedValue(1);
      await searchVideo(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
