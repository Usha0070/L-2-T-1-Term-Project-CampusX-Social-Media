import express from "express";
import * as db from "../db/index.js";
import { authenticate } from "./auth.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const notifications = await db.getNotificationsByUserId(user_id, limit, offset);
    res.status(200).json(notifications);
  } catch (err) {
    console.log("Error in GET /notifications: ", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

export default router;
