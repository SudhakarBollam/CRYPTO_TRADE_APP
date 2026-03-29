const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const { loadConfig } = require("./config");
const swaggerSpec = require("./config/swagger");
const apiV1 = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { createLimiter } = require("./middleware/rateLimit");
const { logger } = require("./utils/logger");

const app = express();
const { env } = loadConfig();

app.use(helmet());
app.use(
  cors({
    origin: env === "production" ? process.env.CORS_ORIGIN || true : true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(createLimiter());

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info("HTTP", {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      ms: Date.now() - start,
    });
  });
  next();
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     security: []
 */
app.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", service: "crypto-portfolio-api" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCss: ".swagger-ui .topbar { display: none }" }));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

app.use("/api/v1", apiV1);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
