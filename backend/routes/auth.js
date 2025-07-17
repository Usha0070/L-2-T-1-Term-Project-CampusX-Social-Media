import "dotenv/config";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as db from "../db/index.js";
import * as schema from "../middleware/schema.js";

const router = express.Router();

export async function generateHashedPassword(password) {
  return await bcrypt.hash(password, 10);
}

router.post("/register", async (req, res, next) => {
  try {
    const body = schema.RegisterSchema.parse(req.body);
    const hashedPassword = await generateHashedPassword(body.password);
    const result = await db.createUser({ ...body, hashed_password: hashedPassword });

    if (result.success) {
      const user = { user_id: result.user_id };
      const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.status(201).json({ user_id: result.user_id, accessToken });
    } else {
      res.status(400).json({ error: result.error || "User creation failed" });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const body = schema.LoginSchema.parse(req.body);
    const hashed = await db.getHashedPasswordByStudentId(body.student_id);
    if (!hashed) {
      return res.status(401).json({ error: "Access denied" });
    }
    const result = await bcrypt.compare(body.password, hashed);
    if (!result) {
      return res.status(401).json({ error: "Access denied" });
    }

    const user_id = await db.getUserIdByStudentId(body.student_id);
    const user = { user_id };

    const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "30d" }); // change later
    res.status(200).json({ user_id, accessToken });
  } catch (err) {
    next(err);
  }
});

export default router;
