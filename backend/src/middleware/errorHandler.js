const { AppError } = require("../utils/errors");
const { logger } = require("../utils/logger");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err instanceof AppError ? err.statusCode : err.statusCode || 500;
  const code = err instanceof AppError ? err.code : "INTERNAL_ERROR";
  const message =
    err instanceof AppError
      ? err.message
      : status === 500
        ? "Internal server error"
        : err.message;

  if (status >= 500) {
    logger.error("Request failed", { err: err.message, stack: err.stack, path: req.path });
  }

  const body = {
    success: false,
    error: {
      code,
      message,
      ...(err instanceof AppError && err.details ? { details: err.details } : {}),
    },
  };

  res.status(status).json(body);
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Cannot ${req.method} ${req.originalUrl}` },
  });
}

module.exports = { errorHandler, notFoundHandler };
