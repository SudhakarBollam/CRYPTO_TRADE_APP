require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { loadConfig } = require("./config");
const { logger } = require("./utils/logger");

const { port } = loadConfig();

connectDB().then(() => {
  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
});
