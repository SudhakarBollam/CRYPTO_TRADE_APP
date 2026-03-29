const express = require("express");
const authRoutes = require("./authRoutes");
const tradeRoutes = require("./tradeRoutes");
const portfolioRoutes = require("./portfolioRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const adminRoutes = require("./adminRoutes");
const marketRoutes = require("./marketRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/trades", tradeRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/admin", adminRoutes);
router.use("/market", marketRoutes);

module.exports = router;
