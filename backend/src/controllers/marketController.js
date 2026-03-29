const { asyncHandler } = require("../utils/errors");
const marketService = require("../services/marketService");

const prices = asyncHandler(async (req, res) => {
  const ids = req.query.ids || undefined;
  const data = await marketService.getSimplePrices(ids);
  res.json({ success: true, data });
});

module.exports = { prices };
