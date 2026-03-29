const axios = require("axios");
const { loadConfig } = require("../config");
const { AppError } = require("../utils/errors");
const { logger } = require("../utils/logger");

const PRICE_CACHE_MS = 45_000;
let priceCache = { key: "", data: null, expiresAt: 0 };

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableCoinGeckoError(e) {
  const status = e.response?.status;
  if (!e.response) return true;
  if (status === 429) return true;
  if (status >= 500) return true;
  return false;
}

async function getSimplePrices(idsParam) {
  const { coingeckoBase, coingeckoApiKey } = loadConfig();
  const ids =
    idsParam ||
    "bitcoin,ethereum,binancecoin,cardano,solana,ripple,dogecoin,polkadot,matic-network";
  const now = Date.now();
  if (priceCache.key === ids && priceCache.data && now < priceCache.expiresAt) {
    return priceCache.data;
  }

  const url = `${coingeckoBase}/simple/price`;
  const headers = coingeckoApiKey ? { "x-cg-demo-api-key": coingeckoApiKey } : {};
  const config = {
    params: {
      ids,
      vs_currencies: "usd",
      include_24hr_change: true,
    },
    headers,
    timeout: 15000,
  };

  const maxAttempts = 4;
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await axios.get(url, config);
      priceCache = { key: ids, data, expiresAt: Date.now() + PRICE_CACHE_MS };
      return data;
    } catch (e) {
      lastErr = e;
      const status = e.response?.status;
      if (attempt < maxAttempts && isRetryableCoinGeckoError(e)) {
        logger.warn("CoinGecko request failed, retrying", {
          attempt,
          upstreamStatus: status,
          message: e.message,
        });
        await sleep(400 * attempt);
        continue;
      }
      break;
    }
  }

  const status = lastErr.response?.status;
  const detail = lastErr.response?.data;
  logger.error("CoinGecko price fetch failed after retries", {
    upstreamStatus: status,
    detail: typeof detail === "object" ? JSON.stringify(detail) : detail,
    message: lastErr.message,
  });
  throw new AppError(502, "Unable to fetch market prices", "UPSTREAM_ERROR", {
    message: lastErr.message,
    upstreamStatus: status,
    upstreamDetail: typeof detail === "object" ? JSON.stringify(detail) : detail,
  });
}

module.exports = { getSimplePrices };
