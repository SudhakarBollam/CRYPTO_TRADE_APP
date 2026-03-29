const rateLimit = require("express-rate-limit");
const { loadConfig } = require("../config");

function createLimiter() {
  const { rateLimitWindowMs, rateLimitMax } = loadConfig();
  return rateLimit({
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: "RATE_LIMIT", message: "Too many requests, please try again later." },
    },
  });
}

module.exports = { createLimiter };
