const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { AppError } = require("../utils/errors");
const { loadConfig } = require("../config");
const { signToken } = require("../middleware/auth");

const { bcryptSaltRounds } = loadConfig();

async function register({ email, password, name }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(409, "Email already registered", "EMAIL_EXISTS");
  }
  const passwordHash = await bcrypt.hash(password, bcryptSaltRounds);
  const user = await User.create({
    email,
    passwordHash,
    name: name || "",
    role: "user",
  });
  const token = signToken(user);
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }
  const token = signToken(user);
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

module.exports = { register, login };
