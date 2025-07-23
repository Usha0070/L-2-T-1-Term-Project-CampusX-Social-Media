import express from "express";
import * as db from "../db/index.js";

const router = express.Router();

/**
 * @route GET /api/search
 * @description Search across users, groups, and posts
 * @query {string} q - Search query
 * @query {number} [limit=10] - Maximum number of results per category
 * @query {string} [filters] - Comma-separated list of categories to search in (users,groups,posts)
 * @returns {Object} Search results grouped by category
 */
router.get("/", async (req, res, next) => {
  try {
    const { q, limit, filters } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: "Search query is required",
      });
    }

    // Parse filters if provided
    const filterArray = filters
      ? filters.split(",").filter((f) => ["users", "groups", "posts"].includes(f))
      : undefined;

    // Parse limit if provided
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
