const jwt = require("jsonwebtoken");
const { protect, admin } = require("../../../src/middlewares/auth");

const mockUserModel = {
  findOne: jest.fn(),
};
jest.mock("jsonwebtoken");
jest.mock("../../../src/sequelize", () => ({
  User: mockUserModel,
}));

// Helper to run middleware with mocked Express arguments
const runMiddleware = (mw, reqProps = {}, user = {}, doNext = true) => {
  const req = { headers: {}, user, ...reqProps };
  const res = {};
  const next = jest.fn();
  mw(req, res, next);
  return next;
};

describe("auth middleware: protect", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("sends 401 if no Authorization header", async () => {
    const req = { headers: {} };
    const next = jest.fn();
    await protect(req, {}, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/logged in/i),
        statusCode: 401,
      })
    );
  });

  it("sends 401 if token is invalid", async () => {
    // Simulate a Bearer token
    const req = { headers: { authorization: "Bearer BADTOKEN" } };
    jwt.verify.mockImplementation(() => {
      throw new Error("bad token");
    });

    const next = jest.fn();
    await protect(req, {}, next);
    expect(jwt.verify).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it("attaches user to req and calls next if token and user valid", async () => {
    const fakeUser = {
      id: 1,
      firstname: "John",
      lastname: "Doe",
      username: "johndoe",
      email: "john@example.com",
      avatar: "avatar.png",
      cover: "cover.png",
      channelDescription: "desc",
    };
    jwt.verify.mockReturnValue({ id: 1 });
    mockUserModel.findOne.mockResolvedValue(fakeUser);

    const req = { headers: { authorization: "Bearer FAKE123" } };
    const next = jest.fn();

    await protect(req, {}, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "FAKE123",
      expect.any(String)
    );
    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      attributes: expect.arrayContaining([
        "id",
        "firstname",
        "lastname",
        "username",
      ]),
      where: { id: 1 },
    });
    expect(req.user).toBe(fakeUser);
    expect(next).toHaveBeenCalled();
  });
});

describe("auth middleware: admin", () => {
  it("calls next if req.user.isAdmin is true", () => {
    const req = { user: { isAdmin: true } };
    const next = jest.fn();
    admin(req, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next with error (401) if req.user.isAdmin is false/undefined", () => {
    let req = { user: { isAdmin: false } };
    let next = jest.fn();
    admin(req, {}, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/admin/i),
        statusCode: 401,
      })
    );
    req = { user: {} };
    next = jest.fn();
    admin(req, {}, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/admin/i),
        statusCode: 401,
      })
    );
  });
});
