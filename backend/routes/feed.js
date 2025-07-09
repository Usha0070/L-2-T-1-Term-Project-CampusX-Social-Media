import express from "express";
import { getFeedByUserId } from "../models/feed.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    console.log("🔥 /api/feed route hit");
    console.log("👤 Logged-in user ID:", user_id);
    console.log("🔢 Page:", page);

    const posts = await getFeedByUserId(user_id, page, limit);
    res.json(posts);  // returns posts with author_name included
  } catch (err) {
    console.error("❌ Error fetching feed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
