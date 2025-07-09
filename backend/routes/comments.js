// routes/comments.js
import express from "express";
import { getCommentsByPostId, createComment } from "../db/comment.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get comments for a post
router.get("/:post_id", authenticate, async (req, res, next) => {
  try {
    const { post_id } = req.params;
    const comments = await getCommentsByPostId(post_id);
    res.json(comments);
  } catch (err) {
    console.error("❌ Failed to fetch comments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Post a new comment
router.post("/:post_id", authenticate, async (req, res) => {
  try {
    const { post_id } = req.params;
    const { content } = req.body;
    const author_id = req.user.user_id;

    const newComment = await createComment({
      post_id,
      author_id,
      content,
      parent_comment_id: null,
    });

    res.json(newComment);
  } catch (err) {
    console.error("❌ Failed to create comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
