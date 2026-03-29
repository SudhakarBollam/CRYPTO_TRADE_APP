const express = require("express");
const marketController = require("../controllers/marketController");
const { optionalAuthenticate } = require("../middleware/auth");
const { marketPricesQuery, runValidation } = require("../utils/validation");

const router = express.Router();

/**
 * @openapi
 * /api/v1/market/prices:
 *   get:
 *     tags: [Market]
 *     summary: CoinGecko simple prices (USD)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: ids
 *         schema: { type: string }
 *         description: Comma-separated CoinGecko coin ids
 */
router.get("/prices", optionalAuthenticate, marketPricesQuery, runValidation, marketController.prices);

module.exports = router;
