import express from "express";
import * as db from "../db/index.js";
import { authenticate } from "./auth.js";

const router = express.Router();

router.get("/:id", authenticate, async (req, res) => {
  try {
    const user_id = req.params.id;
    const user = await db.getUserByUserId(user_id);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.post("/", authenticate, async (req, res) => {
  const user = req.body;
  const result = db.postUser(user);
  if (result.success) {
    res.status().json();
  } else {
    res.status.json();
  }
});

export default router;
