const Trade = require("../models/Trade");
const mongoose = require("mongoose");

async function summary(scope) {
  const match =
    scope.userId != null
      ? { user: new mongoose.Types.ObjectId(scope.userId) }
      : {};

  const [agg] = await Trade.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalTrades: { $sum: 1 },
        totalBuyVolume: {
          $sum: { $cond: [{ $eq: ["$type", "BUY"] }, "$quantity", 0] },
        },
        totalSellVolume: {
          $sum: { $cond: [{ $eq: ["$type", "SELL"] }, "$quantity", 0] },
        },
        uniqueAssets: { $addToSet: "$asset" },
      },
    },
    {
      $project: {
        _id: 0,
        totalTrades: 1,
        totalBuyVolume: 1,
        totalSellVolume: 1,
        uniqueAssetCount: { $size: "$uniqueAssets" },
      },
    },
  ]);

  return (
    agg || {
      totalTrades: 0,
      totalBuyVolume: 0,
      totalSellVolume: 0,
      uniqueAssetCount: 0,
    }
  );
}

async function byAsset(scope) {
  const match =
    scope.userId != null
      ? { user: new mongoose.Types.ObjectId(scope.userId) }
      : {};

  return Trade.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$asset",
        trades: { $sum: 1 },
        buyQty: { $sum: { $cond: [{ $eq: ["$type", "BUY"] }, "$quantity", 0] } },
        sellQty: { $sum: { $cond: [{ $eq: ["$type", "SELL"] }, "$quantity", 0] } },
        avgBuyPrice: {
          $avg: { $cond: [{ $eq: ["$type", "BUY"] }, "$price", null] },
        },
        avgSellPrice: {
          $avg: { $cond: [{ $eq: ["$type", "SELL"] }, "$price", null] },
        },
      },
    },
    {
      $project: {
        asset: "$_id",
        trades: 1,
        buyQty: 1,
        sellQty: 1,
        netQty: { $subtract: ["$buyQty", "$sellQty"] },
        avgBuyPrice: 1,
        avgSellPrice: 1,
        _id: 0,
      },
    },
    { $sort: { asset: 1 } },
  ]);
}

module.exports = { summary, byAsset };
