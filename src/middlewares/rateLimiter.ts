import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { getRedisClient } from "../config/redis";

export const createRateLimiter = async () => {
  const redisClient = await getRedisClient();

  return rateLimit({
    // Store mechanism using Redis
    // The `rate-limit-redis` package provides a RedisStore exported as default
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),

    // Window limit settings
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers

    // Custom response message
    message: {
      error: "Too Many Requests",
      message:
        "Too many requests from this IP, please try again after 15 minutes.",
      status: 429,
    },
  });
};

export const createAuthRateLimiter = async () => {
  const redisClient = await getRedisClient();

  return rateLimit({
    // Store mechanism using Redis
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),

    // Stricter window limit settings for Auth
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per window per auth route
    standardHeaders: true,
    legacyHeaders: false,

    message: {
      error: "Too Many Requests",
      message:
        "Too many authentication attempts from this IP, please try again after 15 minutes.",
      status: 429,
    },
  });
};
