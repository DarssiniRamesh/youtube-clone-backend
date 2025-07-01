const { signup, login, me } = require('../../../src/controllers/auth');
const { User, Subscription } = require('../../../src/sequelize');
const jwt = require('jsonwebtoken');

jest.mock('../../../src/sequelize');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(() => Promise.resolve('salt')),
  hash: jest.fn((pwd, salt) => Promise.resolve('hashed' + pwd)),
  compare: jest.fn((a, b) => Promise.resolve(a === b)),
}));

describe('Auth Controller Unit Tests', () => {
  let req, res, next;
  beforeEach(() => {
    req = { body: {}, user: { id: 1 } };
    res = { status: jest.fn(() => res), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('signs up new user and returns token', async () => {
      User.create.mockResolvedValue({ ...req.body, save: jest.fn(), password: 'pass', id: 42 });
      jwt.sign.mockReturnValue('jwt-token');
      await signup(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: 'jwt-token' });
    });
    it('handles User.create error', async () => {
      User.create.mockRejectedValue(new Error('DB error'));
      await signup(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('login', () => {
    it('logs in valid user and returns token', async () => {
      User.findOne.mockResolvedValue({ password: 'match', id: 7 });
      jwt.sign.mockReturnValue('jwt-token');
      req.body = { email: 'a', password: 'match' };
      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: 'jwt-token' });
    });
    it('rejects unknown email', async () => {
      User.findOne.mockResolvedValue(null);
      req.body = { email: 'missing', password: 'x' };
      await login(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 400 }));
    });
    it('rejects password mismatch', async () => {
      User.findOne.mockResolvedValue({ password: 'real', id: 22 });
      req.body = { email: 'a', password: 'nope' };
      await login(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), statusCode: 400 }));
    });
  });

  describe('me', () => {
    it('returns user profile with channels', async () => {
      const userObj = {
        setDataValue: jest.fn(),
      };
      User.findByPk.mockResolvedValue(userObj);
      Subscription.findAll.mockResolvedValue([{ subscribeTo: 3 }, { subscribeTo: 5 }]);
      User.findAll.mockResolvedValue([{ username: 'chan1' }, { username: 'chan2' }]);
      req.user.id = 100;
      await me(req, res);
      expect(userObj.setDataValue).toHaveBeenCalledWith('channels', expect.any(Array));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
