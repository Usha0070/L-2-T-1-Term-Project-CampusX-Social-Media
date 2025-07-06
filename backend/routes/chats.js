import express from "express";
import * as db from "../db/index.js";
import * as schema from "../middleware/schema.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const chats = await db.getChatsByUserId(user_id);
    res.status(200).json(chats);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = {
      user1_id: req.user.user_id,
      ...schema.ChatSchema.parse(req.body),
    };
    const result = await db.createChat(body);
    if (result.error) return res.status(200).json(result);
    res.status(400).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const chat_id = req.params.id;
    const result = await db.checkUserIdChatId(user_id, chat_id);
    if (result.length == 0) {
      res.status(403).json({ error: "Access denied" });
    } else {
      const chat = await db.getChatByChatId(chat_id);
      res.status(200).json(chat);
    }
  } catch (err) {
    next(err);
  }
});

router.post("/:id", async (req, res, next) => {
  try {
    const body = {
      chat_id: req.params.id,
      sender_id: req.user.user_id,
      ...schema.MessageSchema.parse(req.body),
    };
    if (!(await db.validateUserChat(body.sender_id, body.chat_id)))
      return res.status(403).json({ error: "Access denied" });
    const result = await db.createMessage(body);
    if (result.error) return res.status(400).json(result);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/:mid", async (req, res, next) => {
  try {
    const body = {
      message_id: req.params.mid,
      chat_id: req.params.id,
      ...schema.MessageSchema.parse(req.body),
    };
    if (!(await db.validateUserChat(req.user.user_id, body.chat_id)))
      return res.status(403).json({ error: "Access denied" });
    const result = await db.modifyMessage(body);
    if (result.error) return res.status(400).json(result);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/:mid", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const chat_id = req.params.id;
    const message_id = req.params.mid;
    if (!(await db.validateUserChat(user_id, chat_id)))
      return res.status(403).json({ error: "Access denied" });
    const result = await db.deleteMessage(message_id);
    if (result.error) return res.status(400).json(result);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
