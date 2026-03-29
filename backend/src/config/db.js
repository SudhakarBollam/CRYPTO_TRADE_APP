const mongoose = require("mongoose");
const { loadConfig } = require("./index");
const { logger } = require("../utils/logger");

const connectDB = async () => {
  try {
    const { mongoUri } = loadConfig();
    const conn = await mongoose.connect(mongoUri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("DB connection error", { message: error.message });
    process.exit(1);
  }
};

module.exports = connectDB;
