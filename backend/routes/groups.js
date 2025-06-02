import express from "express";
import * as db from "../db/index.js";
import { authenticate } from "./auth.js";

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const groups = await db.getGroups();
    res.status(200).json(groups);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const group_id = req.params.id;
    const group = await db.getGroupByGroupId(group_id);
    res.status(200).json(group);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/mods", authenticate, async (req, res, next) => {
  try {
    const group_id = req.params.id;
    const mods = await db.getGroupModsByGroupId(group_id);
    res.status(200).json(mods);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/members", authenticate, async (req, res, next) => {
  try {
    const group_id = req.params.id;
    const members = await db.getGroupMembersByGroupId(group_id);
    res.status(200).json(members);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/posts", authenticate, async (req, res, next) => {
  try {
    const group_id = req.params.id;
    const posts = await db.getGroupPostsByGroupId(group_id);
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
});

export default router;
