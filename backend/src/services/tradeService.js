const Trade = require("../models/Trade");
const { AppError } = require("../utils/errors");
const mongoose = require("mongoose");

function buildTradeFilter(role, userId, query) {
  const filter = {};
  if (role === "user") {
    filter.user = new mongoose.Types.ObjectId(userId);
  } else if (query.userId && (role === "admin" || role === "analyst")) {
    filter.user = new mongoose.Types.ObjectId(query.userId);
  }
  if (query.asset) {
    filter.asset = String(query.asset).toUpperCase();
  }
  if (query.type) {
    filter.type = query.type;
  }
  return filter;
}

async function createTrade(userId, data) {
  const doc = await Trade.create({
    user: userId,
    asset: data.asset,
    type: data.type,
    price: data.price,
    quantity: data.quantity,
    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    note: data.note || "",
  });
  return doc.populate("user", "email name role");
}

async function listTrades(role, userId, query) {
  const page = query.page || 1;
  const limit = Math.min(query.limit || 20, 100);
  const skip = (page - 1) * limit;
  const filter = buildTradeFilter(role, userId, query);

  const [items, total] = await Promise.all([
    Trade.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "email name role"),
    Trade.countDocuments(filter),
  ]);

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
}

async function getTradeById(id, role, userId) {
  const trade = await Trade.findById(id).populate("user", "email name role");
  if (!trade) {
    throw new AppError(404, "Trade not found", "NOT_FOUND");
  }
  if (role === "user" && trade.user._id.toString() !== userId) {
    throw new AppError(403, "Not allowed to access this trade", "FORBIDDEN");
  }
  return trade;
}

async function updateTrade(id, role, userId, data) {
  const trade = await Trade.findById(id);
  if (!trade) {
    throw new AppError(404, "Trade not found", "NOT_FOUND");
  }
  const isOwner = trade.user.toString() === userId;
  if (role === "user" && !isOwner) {
    throw new AppError(403, "Not allowed to update this trade", "FORBIDDEN");
  }
  if (role !== "admin" && role !== "user") {
    throw new AppError(403, "Analysts have read-only access", "FORBIDDEN");
  }

  if (data.asset !== undefined) trade.asset = data.asset;
  if (data.type !== undefined) trade.type = data.type;
  if (data.price !== undefined) trade.price = data.price;
  if (data.quantity !== undefined) trade.quantity = data.quantity;
  if (data.timestamp !== undefined) trade.timestamp = new Date(data.timestamp);
  if (data.note !== undefined) trade.note = data.note;

  await trade.save();
  return trade.populate("user", "email name role");
}

async function deleteTrade(id, role, userId) {
  const trade = await Trade.findById(id);
  if (!trade) {
    throw new AppError(404, "Trade not found", "NOT_FOUND");
  }
  const isOwner = trade.user.toString() === userId;
  if (role === "user" && !isOwner) {
    throw new AppError(403, "Not allowed to delete this trade", "FORBIDDEN");
  }
  if (role === "analyst") {
    throw new AppError(403, "Analysts have read-only access", "FORBIDDEN");
  }
  await trade.deleteOne();
  return { id };
}

async function portfolioSummary(userId) {
  const pipeline = [
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$asset",
        totalBuyQty: {
          $sum: { $cond: [{ $eq: ["$type", "BUY"] }, "$quantity", 0] },
        },
        totalSellQty: {
          $sum: { $cond: [{ $eq: ["$type", "SELL"] }, "$quantity", 0] },
        },
        buyNotional: {
          $sum: { $cond: [{ $eq: ["$type", "BUY"] }, { $multiply: ["$price", "$quantity"] }, 0] },
        },
        sellNotional: {
          $sum: { $cond: [{ $eq: ["$type", "SELL"] }, { $multiply: ["$price", "$quantity"] }, 0] },
        },
        tradeCount: { $sum: 1 },
      },
    },
    {
      $project: {
        asset: "$_id",
        netQuantity: { $subtract: ["$totalBuyQty", "$totalSellQty"] },
        totalBuyQuantity: "$totalBuyQty",
        totalSellQuantity: "$totalSellQty",
        buyNotional: 1,
        sellNotional: 1,
        tradeCount: 1,
        _id: 0,
      },
    },
    { $sort: { asset: 1 } },
  ];
  return Trade.aggregate(pipeline);
}

module.exports = {
  createTrade,
  listTrades,
  getTradeById,
  updateTrade,
  deleteTrade,
  portfolioSummary,
  buildTradeFilter,
};
