import express from "express";
import * as db from "../db/index.js";
import { generateHashedPassword } from "./auth.js";
import * as schema from "../middleware/schema.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// self

router.get("/me", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const user = await db.getUserByUserId(user_id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

router.put("/me", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const body = {
      user_id,
      ...schema.UserSchema.parse(req.body),
      ...(req.body.password && { hashed_password: generateHashedPassword(req.body.password) }),
    };
    const result = await db.updateUser(body);
    if (result.success) res.status(200).json(result);
    else res.status(400).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/me/profile", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const profile = await db.getUserProfileByUserId(user_id);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/me/profile",
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const user_id = req.user.user_id;
      const body = {
        user_id,
        ...schema.ProfileSchema.parse(req.body),
        profile_pic: req.files?.profile_pic?.[0]?.path,
        cover_photo: req.files?.cover_photo?.[0]?.path,
      };
      const result = await db.updateUserProfile(body);
      if (result.error) return res.status(400).json({ error: result.error });
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/me/posts", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const posts = await db.getPostsByUserId(user_id);
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
});

router.get("/me/feed", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    console.log("Feed requested for user:", user_id);
    const posts = await db.getFeedByUserId(user_id);
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
});

router.get("/me/friends", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const friends = await db.getFriendsByUserId(user_id);
    res.status(200).json(friends);
  } catch (err) {
    next(err);
  }
});

router.put("/me/friends", async (req, res, next) => {
  try {
    const body = schema.FriendSchema.parse(req.body);
    const result = await db.updateFriendship({ ...body, user_id: req.user.user_id });
    if (result.error) return res.status(400).json(result);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/me/follows", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const follows = await db.getFollowsByUserId(user_id);
    res.status(200).json(follows);
  } catch (err) {
    next(err);
  }
});

router.put("/me/follows", async (req, res, next) => {
  try {
    const body = schema.FollowSchema.parse(req.body);
    const result = await db.updateFollow({ ...body, user_id: req.user.user_id });
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/me/blocks", async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const blocks = await db.getBlocksByUserId(user_id);
    res.status(200).json(blocks);
  } catch (err) {
    next(err);
  }
});

router.put("/me/blocks", async (req, res, next) => {
  try {
    const body = schema.BlockSchema.parse(req.body);
    const result = await db.updateBlock({ ...body, user_id: req.user.user_id });
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// public

router.get("/:id", async (req, res, next) => {
  try {
    const user_id = req.params.id;
    const user = await db.getUserByUserId(user_id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/profile", async (req, res, next) => {
  try {
    const user_id = req.params.id;
    const profile = await db.getUserProfileByUserId(user_id);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/posts", async (req, res, next) => {
  try {
    const user_id = req.params.id;
    const posts = await db.getPostsByUserId(user_id);
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
});

export default router;
