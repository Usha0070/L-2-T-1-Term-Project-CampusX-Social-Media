import express from "express";
import * as db from "../db/index.js";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import * as schema from "../middleware/schema.js";

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const groups = await db.getGroups();
    res.status(200).json(groups);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authenticate,
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const body = {
        creator_id: req.user.user_id,
        admin_id: req.user.user_id,
        ...schema.GroupSchema.parse(req.body),
        profile_pic: req.files?.profile_pic?.[0]?.path,
        cover_photo: req.files?.cover_photo?.[0]?.path,
      };
      const result = await db.createGroup(body);
      if (result.error) return res.status(400).json(result);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const group_id = req.params.id;
    const group = await db.getGroupByGroupId(group_id);
    res.status(200).json(group);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:id",
  authenticate,
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const body = {
        group_id: req.params.id,
        ...schema.GroupSchema.parse(req.body),
        profile_pic: req.files?.profile_pic?.[0]?.path,
        cover_photo: req.files?.cover_photo?.[0]?.path,
      };
      if (!(await db.validateUserGroupMod(req.user.user_id, body.group_id)))
        return res.status(400).json({ error: "Access denied" });

      const result = await db.modifyGroup(body);
      if (result.error) return res.status(400).json(result);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:id/mods", authenticate, async (req, res, next) => {
  try {
    const group_id = req.params.id;
    const mods = await db.getGroupModsByGroupId(group_id);
    res.status(200).json(mods);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/mods", authenticate, async (req, res, next) => {
  try {
    const body = {
      group_id: req.params.id,
      ...schema.ModSchema.parse(req.body),
    };
    if (!(await db.validateUserGroupMod(req.user.user_id, body.group_id)))
      return res.status(400).json({ error: "Access denied" });
    const result = await db.createGroupMod(body);
    if (result.error) return res.status(400).json(result);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/mods/:mid", authenticate, async (req, res, next) => {
  try {
    const body = {
      group_id: req.params.id,
      user_id: req.params.mid,
    };
    if (!(await db.validateUserGroupMod(req.user.user_id, body.group_id)))
      return res.status(400).json({ error: "Access denied" });
    const result = await db.deleteGroupMod(body);
    if (result.error) return res.status(400).json(result);
    res.status(200).json(result);
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

router.post("/:id/members", authenticate, async (req, res, next) => {
  try {
    const body = {
      group_id: req.params.id,
      ...schema.ModSchema.parse(req.body),
    };
    if (!(await db.validateUserGroupMod(req.user.user_id, body.group_id)))
      return res.status(400).json({ error: "Access denied" });
    const result = await db.createGroupMember(body);
    if (result.error) return res.status(400).json(result);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/members/:mid", authenticate, async (req, res, next) => {
  try {
    const body = {
      group_id: req.params.id,
      user_id: req.params.mid,
    };
    if (!(await db.validateUserGroupMod(req.user.user_id, body.group_id)))
      return res.status(400).json({ error: "Access denied" });
    const result = await db.deleteGroupMember(body);
    if (result.error) return res.status(400).json(result);
    res.status(200).json(result);
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

router.post("/:id/posts", authenticate, async (req, res, next) => {
  try {
    const body = {
      group_id: req.params.id,
      ...schema.GroupPostSchema.parse(req.body),
    };
    if (!(await db.validateUserGroupMember(req.user.user_id, body.group_id)))
      return res.status(400).json({ error: "Access denied" });
    const result = await db.createGroupPost(body);
    if (result.error) return res.status(200).json(result);
    res.status(400).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/posts/:pid", authenticate, async (req, res, next) => {
  try {
    const body = {
      group_id: req.params.id,
      post_id: req.params.pid,
      ...schema.GroupPostSchema2.parse(req.body),
    };
    if (!(await db.validateUserGroupMember(req.user.user_id, body.group_id)))
      return res.status(400).json({ error: "Access denied" });
    if (!(await db.validateUserGroupPost(req.user.user_id, body.group_id, body.post_id)))
      return res.status(400).json({ error: "Access denied" });
    const result = await db.modifyGroupPost(body);
    if (result.error) return res.status(200).json(result);
    res.status(400).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/posts/:pid", authenticate, async (req, res, next) => {
  try {
    const body = {
      group_id: req.params.id,
      post_id: req.params.pid,
    };
    if (!(await db.validateUserGroupMember(req.user.user_id, body.group_id, body.post_id)))
      return res.status(200).json({ error: "Access denied" });
    const result = await db.deleteGroupPost(body);
    if (result.error) return res.status(200).json(result);
    res.status(400).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
