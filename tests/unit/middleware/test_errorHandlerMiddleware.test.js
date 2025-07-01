const errorHandler = require("../../../src/middlewares/errorHandler");

describe("errorHandler Middleware", () => {
  let req, res, next;
  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("handles generic unknown error", () => {
    const err = new Error("Unknown");
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: "false",
      message: "Unknown",
    });
  });

  it("defaults to Internal Server Error if no message", () => {
    const err = {};
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: "false",
      message: "Internal Server Error",
    });
  });

  it("handles SequelizeValidationError", () => {
    const err = {
      name: "SequelizeValidationError",
      errors: [{ path: "email" }, { path: "username" }],
    };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: "false",
      message: "These fields should not be empty: email, username",
    });
  });

  it("handles SequelizeUniqueConstraintError", () => {
    const err = {
      name: "SequelizeUniqueConstraintError",
      errors: [{ path: "username" }],
    };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: "false",
      message: "The username is already taken",
    });
  });

  it("prefers Sequelize* errors over generic message", () => {
    // Both names present, prefers validation
    const err = {
      name: "SequelizeValidationError",
      message: "ignore me",
      errors: [{ path: "something" }],
    };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toMatch(/These fields/);
  });
});
