const User = require("../models/User");
const { AppError } = require("../utils/errors");

async function listUsers() {
  return User.find().sort({ createdAt: -1 }).select("-passwordHash");
}

async function updateUserRole(actorId, targetUserId, role) {
  if (actorId === targetUserId) {
    throw new AppError(400, "Cannot change your own role via this endpoint", "INVALID_OPERATION");
  }
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError(404, "User not found", "NOT_FOUND");
  }
  user.role = role;
  await user.save();
  return user;
}

module.exports = { listUsers, updateUserRole };
