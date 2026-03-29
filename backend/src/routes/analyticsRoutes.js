const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/rbac");
const { paginationQuery, runValidation } = require("../utils/validation");

const router = express.Router();

router.use(authenticate);
router.use(authorize("analyst", "admin"));

/**
 * @openapi
 * /api/v1/analytics/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Platform-wide or scoped trade summary
 */
router.get("/summary", paginationQuery, runValidation, analyticsController.summary);

/**
 * @openapi
 * /api/v1/analytics/by-asset:
 *   get:
 *     tags: [Analytics]
 *     summary: Aggregates grouped by asset
 */
router.get("/by-asset", paginationQuery, runValidation, analyticsController.byAsset);

module.exports = router;
