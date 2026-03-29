/**
 * Optional entrypoint demonstrating Node.js clustering for vertical scaling.
 * Run: node src/server-cluster.js
 * Place a load balancer (e.g. NGINX) or OS scheduler in front for multiple hosts.
 */
require("dotenv").config();
const cluster = require("cluster");
const os = require("os");
const { loadConfig } = require("./config");
const { logger } = require("./utils/logger");

const { port } = loadConfig();

if (cluster.isPrimary) {
  const n = Math.min(os.cpus().length, Number(process.env.WORKERS) || os.cpus().length);
  logger.info(`Primary ${process.pid} spawning ${n} workers`);
  for (let i = 0; i < n; i += 1) cluster.fork();
  cluster.on("exit", (worker) => {
    logger.warn(`Worker ${worker.process.pid} died; restarting`);
    cluster.fork();
  });
} else {
  const app = require("./app");
  const connectDB = require("./config/db");
  connectDB().then(() => {
    app.listen(port, () => {
      logger.info(`Worker ${process.pid} listening on ${port}`);
    });
  });
}
