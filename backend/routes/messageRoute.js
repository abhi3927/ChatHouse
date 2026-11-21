import express from "express";
import {
  getMessages,
  markMessagesRead,
  sendMessage,
} from "../controllers/messageController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/send/:id", isAuthenticated, sendMessage);
router.put("/read/:id", isAuthenticated, markMessagesRead);
router.get("/:id", isAuthenticated, getMessages);

export default router;
