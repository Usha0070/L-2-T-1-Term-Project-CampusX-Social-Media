import express from "express";
import * as db from "../db/index.js";
import { authenticate } from "./auth.js";

const router = express.Router();

// self

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const user = await db.getUserByUserId(user_id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

router.get("/me/profile", authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const profile = await db.getUserProfileByUserId(user_id);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
});

router.get("/me/posts", authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const posts = await db.getPostsByUserId(user_id);
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
});

router.get("/me/friends", authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const friends = await db.getFriendsByUserId(user_id);
    res.status(200).json(friends);
  } catch (err) {
    next(err);
  }
});

router.get("/me/follows", authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const follows = await db.getFollowsByUserId(user_id);
    res.status(200).json(follows);
  } catch (err) {
    next(err);
  }
});

router.get("/me/blocks", authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const blocks = await db.getBlocksByUserId(user_id);
    res.status(200).json(blocks);
  } catch (err) {
    next(err);
  }
});

router.get("/me/blockers", authenticate, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const blockers = await db.getBlockersByUserId(user_id);
    res.status(200).json(blockers);
  } catch (err) {
    next(err);
  }
});

// public

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const user_id = req.params.id;
    const user = await db.getUserByUserId(user_id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/profile", authenticate, async (req, res, next) => {
  try {
    const user_id = req.params.id;
    const profile = await db.getUserProfileByUserId(user_id);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/posts", authenticate, async (req, res, next) => {
  try {
    const user_id = req.params.id;
    const posts = await db.getPostsByUserId(user_id);
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
});

export default router;
