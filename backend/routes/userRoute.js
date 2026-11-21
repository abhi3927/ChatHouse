import express from "express";
import {
  getMe,
  getOtherUsers,
  login,
  logout,
  register,
} from "../controllers/userController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.get("/logout", logout);
router.get("/me", isAuthenticated, getMe);
router.get("/", isAuthenticated, getOtherUsers);

export default router;
