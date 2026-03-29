const express = require("express");
const adminController = require("../controllers/adminController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/rbac");
const { promoteUserRules, runValidation } = require("../utils/validation");

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 */
router.get("/users", adminController.listUsers);

/**
 * @openapi
 * /api/v1/admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user role (promote/demote)
 */
router.patch("/users/:id/role", promoteUserRules, runValidation, adminController.promoteUser);

module.exports = router;
