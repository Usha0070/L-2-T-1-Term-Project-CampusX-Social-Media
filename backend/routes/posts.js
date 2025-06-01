import express from "express";
import * as db from "../db/index.js";
import { authenticate } from "./auth.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const posts = await db.getPostsById(user_id);
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

export default router;
