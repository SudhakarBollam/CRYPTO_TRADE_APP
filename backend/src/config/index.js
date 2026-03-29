require("dotenv").config();

const requiredInProd = ["JWT_SECRET", "MONGO_URI"];

function loadConfig() {
  const env = process.env.NODE_ENV || "development";
  if (env === "production") {
    for (const key of requiredInProd) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }

  return {
    env,
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crypto_portfolio",
    jwtSecret: process.env.JWT_SECRET || "dev-only-change-in-production",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 300,
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
    coingeckoBase: process.env.COINGECKO_API_URL || "https://api.coingecko.com/api/v3",
    coingeckoApiKey: process.env.COINGECKO_API_KEY || "",
  };
}

module.exports = { loadConfig };
