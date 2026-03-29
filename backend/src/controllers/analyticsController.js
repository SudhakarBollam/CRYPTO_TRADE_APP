const { asyncHandler } = require("../utils/errors");
const { AppError } = require("../utils/errors");
const analyticsService = require("../services/analyticsService");

function assertAnalystOrAdmin(role) {
  if (role !== "analyst" && role !== "admin") {
    throw new AppError(403, "Analytics requires analyst or admin role", "FORBIDDEN");
  }
}

const summary = asyncHandler(async (req, res) => {
  assertAnalystOrAdmin(req.user.role);
  const scope =
    req.user.role === "admin" && req.query.userId ? { userId: req.query.userId } : {};
  const data = await analyticsService.summary(scope);
  res.json({ success: true, data });
});

const byAsset = asyncHandler(async (req, res) => {
  assertAnalystOrAdmin(req.user.role);
  const scope =
    req.user.role === "admin" && req.query.userId ? { userId: req.query.userId } : {};
  const data = await analyticsService.byAsset(scope);
  res.json({ success: true, data });
});

module.exports = { summary, byAsset };
