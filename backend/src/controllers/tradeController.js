const { asyncHandler } = require("../utils/errors");
const { AppError } = require("../utils/errors");
const tradeService = require("../services/tradeService");

const create = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    throw new AppError(403, "Only standard users can create trades for their portfolio", "FORBIDDEN");
  }
  const trade = await tradeService.createTrade(req.user.id, req.body);
  res.status(201).json({ success: true, data: trade });
});

const list = asyncHandler(async (req, res) => {
  const result = await tradeService.listTrades(req.user.role, req.user.id, req.query);
  res.json({ success: true, ...result });
});

const getOne = asyncHandler(async (req, res) => {
  const trade = await tradeService.getTradeById(req.params.id, req.user.role, req.user.id);
  res.json({ success: true, data: trade });
});

const update = asyncHandler(async (req, res) => {
  const trade = await tradeService.updateTrade(req.params.id, req.user.role, req.user.id, req.body);
  res.json({ success: true, data: trade });
});

const remove = asyncHandler(async (req, res) => {
  const result = await tradeService.deleteTrade(req.params.id, req.user.role, req.user.id);
  res.json({ success: true, data: result });
});

const portfolio = asyncHandler(async (req, res) => {
  if (req.user.role === "analyst") {
    throw new AppError(403, "Portfolio is not available for analyst role", "FORBIDDEN");
  }
  let userId = req.user.id;
  if (req.user.role === "admin" && req.query.userId) {
    userId = req.query.userId;
  }
  const rows = await tradeService.portfolioSummary(userId);
  res.json({ success: true, data: rows });
});

module.exports = { create, list, getOne, update, remove, portfolio };
