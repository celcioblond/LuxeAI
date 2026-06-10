import cache from "../utils/cache.js";

export const cacheResponse = (keyFn, ttl) => async (req, res, next) => {
  try {
    const key = typeof keyFn === "function" ? keyFn(req) : keyFn;
    const cached = cache.get(key);
    if (cached) {
      return res.status(200).json(cached);
    }
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200) {
        cache.set(key, data, ttl ?? 300);
      }
      return originalJson(data);
    };
    next();
  } catch (error) {
    next();
  }
};

export const invalidateCache = (...keyFns) => (req, res, next) => {
  keyFns.forEach((keyFn) => {
    const key = typeof keyFn === "function" ? keyFn(req) : keyFn;
    cache.del(key);
  });
  next();
};
