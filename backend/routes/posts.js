import express from "express";
import * as db from "../db/index.js";
import * as schema from "../middleware/schema.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/:id", async (req, res, next) => {
  try {
    const post_id = req.params.id;
    const post = await db.getPostByPostId(post_id);
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
});

router.post("/", upload.fields([{ name: "media", maxCount: 10 }]), async (req, res, next) => {
  try {
    const body = {
      user_id: req.user.user_id,
      ...schema.PostSchema.parse(req.body),
      ...(req.files?.media && {
        post_medias: req.files.media.map((file, index) => ({
          path: file.path,
          context: req.body.media_contexts?.[index],
          order_index: index + 1,
        })),
      }),
    };

    const result = await db.createPost(body);
    if (result.error) return res.status(400).json(result);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", upload.fields([{ name: "media", maxCount: 10 }]), async (req, res, next) => {
  try {
    const body = {
      user_id: req.user.user_id,
      post_id: req.params.id,
      ...schema.PostSchema.parse(req.body),
      ...(req.files?.media && {
        post_medias: req.files.media.map((file, index) => ({
          path: file.path,
          context: req.body.media_contexts?.[index],
          order_index: index + 1,
        })),
      }),
    };
    if (!(await db.validateUserPost(body.user_id, body.post_id)))
      return res.status(400).json({ error: "Access denied" });
    const result = await db.updatePost(body);
    if (result.error) return res.status(400).json(result);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const post_id = req.params.id;
    if (!(await db.validateUserPost(user_id, post_id)))
      return res.status(400).json({ error: "Access denied" });
    const result = await db.deletePost(post_id);
    if (result.error) return res.status(400).json(result);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/likes", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const post_id = req.params.id;
    await db.createPostLike(post_id, user_id);
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/likes", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const post_id = req.params.id;
    await db.deletePostLike(post_id, user_id);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/comments", async (req, res, next) => {
  try {
    const commentData = {
      author_id: req.user.user_id,
      post_id: req.params.id,
      ...schema.CommentSchema.parse(req.body),
    };
    const result = await db.createPostComment(commentData);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/comments/:cid", async (req, res, next) => {
  try {
    const body = {
      comment_id: req.params.cid,
      post_id: req.params.id,
      author_id: req.user.user_id,
      ...schema.CommentSchema.parse(req.body),
    };
    if (!(await db.validateUserComment(body.author_id, body.comment_id)))
      return res.status(400).json({ error: "Access denied" });
    const result = await db.updatePostComment(body);
    if (result.error) return res.status(400).json(result);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/comments/:cid", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const comment_id = req.params.cid;
    if (!(await db.validateUserComment(user_id, comment_id)))
      return res.status(400).json({ error: "Access denied" });
    const result = await db.deletePostComment(comment_id);
    if (result.error) return res.status(400).json(result);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
