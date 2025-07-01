const asyncHandler = require("../../../src/middlewares/asyncHandler");

describe("asyncHandler Middleware", () => {
  it("calls next if the wrapped function returns a resolved Promise", async () => {
    const fn = jest.fn().mockResolvedValue("ok");
    const req = {}, res = {}, next = jest.fn();
    await asyncHandler(fn)(req, res, next);
    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it("calls next(err) if wrapped fn rejects", async () => {
    const err = new Error("fail");
    const fn = jest.fn().mockRejectedValue(err);
    const req = {}, res = {}, next = jest.fn();
    await asyncHandler(fn)(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  it("calls next(err) if wrapped fn throws (sync error)", async () => {
    const err = new Error("boom");
    const fn = jest.fn(() => { throw err; });
    const req = {}, res = {}, next = jest.fn();
    try {
      await asyncHandler(fn)(req, res, next);
    } catch (_) {}
    expect(next).toHaveBeenCalledWith(err);
  });
});
