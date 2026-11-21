import rateLimit from "express-rate-limit";

// Applied to login and signup only: 30 attempts per IP every 15 minutes.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});
