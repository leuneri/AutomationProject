const { register, login } = require("../../src/controllers/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../src/config/db");
const { validationResult } = require("express-validator");

// Mock dependencies
jest.mock("../../src/config/db");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("express-validator", () => {
  const chain = {
    isEmail: () => chain,
    normalizeEmail: () => chain,
    isLength: () => chain,
    trim: () => chain,
    notEmpty: () => chain,
  };
  return {
    body: () => chain,
    validationResult: jest.fn(),
  };
});

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
      array: () => [{ msg: "Registration not found" }],
    });

    const req = { body: {} };
    const res = mockRes(); // mock response
    const next = jest.fn(); // spy

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: "Registration not found" }] });
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

  test('signing failure with JWT should call next with error', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    bcrypt.hash.mockResolvedValue("hashed_password");
    db.query.mockResolvedValue({
      rows: [{ id: "user-1", email: "test@test.com", name: "Test", role: "customer" }],
    });
    const jwtError = new Error("jwt signing failed");
    jwt.sign.mockImplementation(() => { throw jwtError; });

    const req = { body: { email: "test@test.com", password: "password123", name: "Test" } };
    const res = mockRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(jwtError);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  test("never returns password hash in the response", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    bcrypt.hash.mockResolvedValue("hashed_password");
    db.query.mockResolvedValue({
      rows: [{ id: "user-1", email: "test@test.com", name: "Test", role: "customer" }],
    });
    jwt.sign.mockReturnValue("signed_token");

    const req = { body: { email: "test@test.com", password: "password123", name: "Test" } };
    const res = mockRes();

    await register(req, res, jest.fn());

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.user).not.toHaveProperty("password");
  });

  test("inserts user with correct email and name", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    bcrypt.hash.mockResolvedValue("hashed_password");
    db.query.mockResolvedValue({
      rows: [{ id: "user-1", email: "test@test.com", name: "Test", role: "customer" }],
    });
    jwt.sign.mockReturnValue("signed_token");

    const req = { body: { email: "test@test.com", password: "password123", name: "Test" } };
    const res = mockRes();

    await register(req, res, jest.fn());

    expect(db.query).toHaveBeenCalledWith(
      expect.any(String),
      ["test@test.com", "hashed_password", "Test"]
    );
  });

  test("signs JWT with user id and role", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    bcrypt.hash.mockResolvedValue("hashed_password");
    db.query.mockResolvedValue({
      rows: [{ id: "user-1", email: "test@test.com", name: "Test", role: "customer" }],
    });
    jwt.sign.mockReturnValue("signed_token");

    const req = { body: { email: "test@test.com", password: "password123", name: "Test" } };
    const res = mockRes();

    await register(req, res, jest.fn());

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "user-1", role: "customer" },
      expect.any(String),
      { expiresIn: "7d" }
    );
  });

  test("forwards non-duplicate DB errors to next, not as 409", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    bcrypt.hash.mockResolvedValue("hashed_password");
    const otherError = { code: "23502", message: "not null violation" };
    db.query.mockRejectedValue(otherError);

    const req = { body: { email: "test@test.com", password: "password123", name: "Test" } };
    const res = mockRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).not.toHaveBeenCalledWith(409);
    expect(next).toHaveBeenCalledWith(otherError);
  });
});

describe("login", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 400 if validation fails", async () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: "Login not found" }],
    });
    
    const req = { body: {} };
    const res = mockRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: "Login not found" }] });
  });

  test("returns 401 if user not found", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    db.query.mockResolvedValue({ rows: [] }); // No user found

    const req = { body: { email: "nonexistent@test.com", password: "wrongpassword" } };
    const res = mockRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  test("returns 401 if password mismatch", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    db.query.mockResolvedValue({
      rows: [{ id: "user-1", email: "test@test.com", password: "hashed_password", name: "Test", role: "customer" }],
    });
    bcrypt.compare.mockResolvedValue(false);  // mock the bcrypt comparison to fail

    const req = { body: { email: "test@test.com", password: "wrongpassword" } };
    const res = mockRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  test("calls next with error on unexpected DB failure", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    bcrypt.hash.mockResolvedValue("hashed_password");
    const dbError = new Error("connection lost");
    db.query.mockRejectedValue(dbError);

    const req = { body: { email: "test@test.com", password: "password123", name: "Test" } };
    const res = mockRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });

  test("jwt signing failure should call next with error", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    db.query.mockResolvedValue({
      rows: [{ id: "user-1", email: "test@test.com", password: "hashed_password", name: "Test", role: "customer" }],
    });
    bcrypt.compare.mockResolvedValue(true);   // mock the bcrypt comparison to succeed before jwt
    const jwtError = new Error("jwt signing failed");
    jwt.sign.mockImplementation(() => { throw jwtError; });

    const req = { body: { email: "test@test.com", password: "password123" } };
    const res = mockRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(jwtError);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

    test("returns token and user on successful login", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      db.query.mockResolvedValue({
        rows: [{ id: "user-1", email: "test@test.com", password: "hashed_password", name: "Test", role: "customer" }],
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mocked_jwt_token");

      const req = { body: { email: "test@test.com", password: "password123" } };
      const res = mockRes();
      const next = jest.fn();

      await login(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        token: "mocked_jwt_token",
        user: { id: "user-1", email: "test@test.com", name: "Test", role: "customer" }
      });
    });

    // Basic security API testing
    test("never returns password hash in the response", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      db.query.mockResolvedValue({
        rows: [{ id: "user-1", email: "test@test.com", password: "hashed_password", name: "Test", role: "customer" }],
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mocked_jwt_token");

      const req = { body: { email: "test@test.com", password: "password123" } };
      const res = mockRes();

      await login(req, res, jest.fn());

      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.user).not.toHaveProperty("password");
    });

    // mocked password passing, so test password has
    test("compares submitted password against stored hash", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      db.query.mockResolvedValue({
        rows: [{ id: "user-1", email: "test@test.com", password: "hashed_password", name: "Test", role: "customer" }],
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("token");

      const req = { body: { email: "test@test.com", password: "password123" } };
      const res = mockRes();

      await login(req, res, jest.fn());

      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashed_password");
      expect(res.json).toHaveBeenCalledWith({
        token: "token",
        user: { id: "user-1", email: "test@test.com", name: "Test", role: "customer" }
      });
    });
});