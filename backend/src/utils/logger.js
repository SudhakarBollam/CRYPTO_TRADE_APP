const winston = require("winston");
const { loadConfig } = require("../config");

const { env } = loadConfig();

const logger = winston.createLogger({
  level: env === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "crypto-portfolio-api" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
          const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
          return stack
            ? `${timestamp} [${level}] ${message}${extra}\n${stack}`
            : `${timestamp} [${level}] ${message}${extra}`;
        })
      ),
    }),
  ],
});

module.exports = { logger };
