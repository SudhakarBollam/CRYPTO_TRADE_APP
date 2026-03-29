const jwt = require("jsonwebtoken");
const { loadConfig } = require("../config");
const User = require("../models/User");
const { AppError } = require("../utils/errors");
const { asyncHandler } = require("../utils/errors");

function signToken(user) {
  const { jwtSecret, jwtExpiresIn } = loadConfig();
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
}

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required", "UNAUTHORIZED");
  }
  const token = header.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, loadConfig().jwtSecret);
  } catch {
    throw new AppError(401, "Invalid or expired token", "INVALID_TOKEN");
  }
  const user = await User.findById(payload.sub).select("+passwordHash");
  if (!user) {
    throw new AppError(401, "User not found", "UNAUTHORIZED");
  }
  req.user = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
  req.userDoc = user;
  next();
});

function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }
  return authenticate(req, res, next);
}

module.exports = { authenticate, optionalAuthenticate, signToken };
