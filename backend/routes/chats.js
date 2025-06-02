import express from "express";
import * as db from "../db/index.js";
import { authenticate } from "./auth.js";

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const chats = await db.getChatsByUserId(user_id);
    res.status(200).json(chats);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const chat_id = req.params.id;
    const result = await db.checkUserIdChatId(user_id, chat_id);
    if (result.length == 0) {
      res.status(403).json({ error: "Not authorized" });
    } else {
      const chat = await db.getChatByChatId(chat_id);
      res.status(200).json(chat);
    }
  } catch (err) {
    next(err);
  }
});

export default router;
