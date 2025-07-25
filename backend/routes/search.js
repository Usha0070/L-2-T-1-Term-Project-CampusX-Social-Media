import express from "express";
import * as db from "../db/index.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { q, limit, filters } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: "Search query is required",
      });
    }

    const filterArray = filters
      ? filters.split(",").filter((f) => ["users", "groups", "posts"].includes(f))
      : undefined;

    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit < 1)) {
      return res.status(400).json({
        error: "Limit must be a positive number",
      });
    }

    const results = await db.search(q.trim(), {
      limit: parsedLimit,
      filters: filterArray,
    });

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

export default router;
