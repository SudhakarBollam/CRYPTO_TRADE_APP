const express = require("express");
const tradeController = require("../controllers/tradeController");
const { authenticate } = require("../middleware/auth");
const {
  tradeCreateRules,
  tradeUpdateRules,
  tradeIdParam,
  paginationQuery,
  runValidation,
} = require("../utils/validation");

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /api/v1/trades:
 *   post:
 *     tags: [Trades]
 *     summary: Create a trade (standard users only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TradeInput' }
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/", tradeCreateRules, runValidation, tradeController.create);

/**
 * @openapi
 * /api/v1/trades:
 *   get:
 *     tags: [Trades]
 *     summary: List trades with filters and pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *       - in: query
 *         name: asset
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [BUY, SELL] }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Admin/Analyst filter by owner
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", paginationQuery, runValidation, tradeController.list);

/**
 * @openapi
 * /api/v1/trades/{id}:
 *   get:
 *     tags: [Trades]
 *     summary: Get trade by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.get("/:id", tradeIdParam, runValidation, tradeController.getOne);

/**
 * @openapi
 * /api/v1/trades/{id}:
 *   put:
 *     tags: [Trades]
 *     summary: Update trade (owner or admin)
 */
router.put("/:id", tradeIdParam, tradeUpdateRules, runValidation, tradeController.update);

/**
 * @openapi
 * /api/v1/trades/{id}:
 *   delete:
 *     tags: [Trades]
 *     summary: Delete trade (owner or admin)
 */
router.delete("/:id", tradeIdParam, runValidation, tradeController.remove);

module.exports = router;
