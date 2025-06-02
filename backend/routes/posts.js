import express from "express";
import * as db from "../db/index.js";
import { authenticate } from "./auth.js";

const router = express.Router();

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const post_id = req.params.id;
    const post = await db.getPostByPostId(post_id);
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
});

export default router;
