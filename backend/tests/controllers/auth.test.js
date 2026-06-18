const { register } = require("../../src/controllers/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../src/config/db");
const { validationResult } = require("express-validator");

// Mock dependencies
jest.mock("../src/config/db");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("express-validator");

// Mock response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("register", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 400 if validation fails", async () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: "Invalid email" }],
    });

    const req = { body: {} };
    const res = mockRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: "Invalid email" }] });
  });

  test("returns 201 with token and user on success", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    bcrypt.hash.mockResolvedValue("hashed_password");
    db.query.mockResolvedValue({
      rows: [{ id: "user-1", email: "test@test.com", name: "Test", role: "customer" }],
    });
    jwt.sign.mockReturnValue("signed_token");

    const req = { body: { email: "test@test.com", password: "password123", name: "Test" } };
    const res = mockRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      token: "signed_token",
      user: { id: "user-1", email: "test@test.com", name: "Test", role: "customer" },
    });
  });

  test("returns 409 if email already registered", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    bcrypt.hash.mockResolvedValue("hashed_password");
    db.query.mockRejectedValue({ code: "23505" });

    const req = { body: { email: "dupe@test.com", password: "password123", name: "Test" } };
    const res = mockRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Email already registered" });
  });

  test("calls next with error on unexpected DB failure", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    bcrypt.hash.mockResolvedValue("hashed_password");
    const dbError = new Error("connection lost");
    db.query.mockRejectedValue(dbError);

    const req = { body: { email: "test@test.com", password: "password123", name: "Test" } };
    const res = mockRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });

  test("hashes password before storing", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    bcrypt.hash.mockResolvedValue("hashed_password");
    db.query.mockResolvedValue({
      rows: [{ id: "user-1", email: "test@test.com", name: "Test", role: "customer" }],
    });
    jwt.sign.mockReturnValue("signed_token");

    const req = { body: { email: "test@test.com", password: "plaintext", name: "Test" } };
    const res = mockRes();

    await register(req, res, jest.fn());

    const insertCall = db.query.mock.calls[0];
    expect(insertCall[1][1]).toBe("hashed_password");
    expect(insertCall[1][1]).not.toBe("plaintext");
  });
});