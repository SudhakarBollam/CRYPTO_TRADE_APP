const express = require("express");
const tradeController = require("../controllers/tradeController");
const { authenticate } = require("../middleware/auth");
const { query } = require("express-validator");
const { runValidation, isMongoId } = require("../utils/validation");

const router = express.Router();

const portfolioQuery = [
  query("userId").optional().custom((value) => {
    if (value && !isMongoId(value)) throw new Error("Invalid userId");
    return true;
  }),
];

router.get("/", authenticate, portfolioQuery, runValidation, tradeController.portfolio);

module.exports = router;
