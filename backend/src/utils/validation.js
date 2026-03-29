const { body, param, query } = require("express-validator");

const ROLES = ["user", "admin", "analyst"];

function isMongoId(value) {
  return /^[a-fA-F0-9]{24}$/.test(value);
}

const registerRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must include uppercase, lowercase, and a number"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Name must be 1–120 characters"),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const tradeCreateRules = [
  body("asset")
    .trim()
    .notEmpty()
    .withMessage("Asset is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Asset must be 2–20 characters")
    .customSanitizer((v) => String(v).toUpperCase()),
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["BUY", "SELL"])
    .withMessage("Type must be BUY or SELL"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
  body("quantity").isFloat({ gt: 0 }).withMessage("Quantity must be a positive number"),
  body("timestamp")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Timestamp must be a valid ISO 8601 date"),
  body("note")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Note too long"),
];

const tradeUpdateRules = [
  body("asset")
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .customSanitizer((v) => (v ? String(v).toUpperCase() : v)),
  body("type").optional().trim().isIn(["BUY", "SELL"]),
  body("price").optional().isFloat({ gt: 0 }),
  body("quantity").optional().isFloat({ gt: 0 }),
  body("timestamp").optional({ nullable: true }).isISO8601(),
  body("note").optional({ nullable: true }).trim().isLength({ max: 2000 }),
];

const tradeIdParam = [
  param("id")
    .notEmpty()
    .withMessage("Trade id is required")
    .custom((value) => {
      if (!isMongoId(value)) throw new Error("Invalid trade id");
      return true;
    }),
];

const paginationQuery = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("asset").optional().trim().isLength({ min: 1, max: 20 }),
  query("type").optional().trim().isIn(["BUY", "SELL"]),
  query("userId").optional().custom((value) => {
    if (value && !isMongoId(value)) throw new Error("Invalid userId");
    return true;
  }),
];

const promoteUserRules = [
  param("id")
    .notEmpty()
    .withMessage("User id is required")
    .custom((value) => {
      if (!isMongoId(value)) throw new Error("Invalid user id");
      return true;
    }),
  body("role")
    .notEmpty()
    .withMessage("role is required")
    .isIn(ROLES)
    .withMessage(`role must be one of: ${ROLES.join(", ")}`),
];

const marketPricesQuery = [
  query("ids")
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("ids query must be a comma-separated CoinGecko id list"),
];

function runValidation(req, res, next) {
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const { AppError } = require("./errors");
    return next(
      new AppError(400, "Validation failed", "VALIDATION_ERROR", errors.array())
    );
  }
  next();
}

module.exports = {
  registerRules,
  loginRules,
  tradeCreateRules,
  tradeUpdateRules,
  tradeIdParam,
  paginationQuery,
  promoteUserRules,
  marketPricesQuery,
  runValidation,
  ROLES,
  isMongoId,
};
