import express from "express";
import * as db from "../db/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const limit = parseInt(req.query.limit) || 200;
    const offset = parseInt(req.query.offset) || 0;

    const notifications = await db.getNotificationsByUserId(user_id, limit, offset);
    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
});

export default router;
