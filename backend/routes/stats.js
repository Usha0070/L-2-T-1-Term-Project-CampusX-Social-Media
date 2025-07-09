import express from "express";
import * as db from "../db/index.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const type = req.query.type;
    var result;
    switch (type) {
      case "users_joined":
        result = await db.getUserJoined(req.query);
        break;

      case "top_posts":
        result = await db.getTopPosts(req.query);
        break;

      case "active_users":
        result = await db.getActiveUsers(req.query);
        break;

      case "active_groups":
        result = await db.getActiveGroups(req.query);
        break;

      case "trends":
        result = await db.getTrends(req.query);
        break;

      case "marketplace_stats":
        result = await db.getMarketplaceStats();
        break;

      case "tuition_stats":
        result = await db.getTuitionStats();
        break;

      default:
        return res.status(400).json({ error: "Invalid query" });
    }
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
