import "dotenv/config";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import z from "zod";
import * as db from "../db/index.js";
import * as schema from "../schemas/index.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const body = schema.RegisterSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const result = await db.createUser({ ...body, hashed_password: hashedPassword });

    if (result.success) {
      const user = { user_id: result.user_id };
      const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.status(201).json({ user_id: result.user_id, accessToken });
    } else {
      res.status(400).json({ error: result.error || "User creation failed" });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
    } else {
      next(err);
    }
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

    const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ user_id, accessToken });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
    } else {
      next(err);
    }
  }
});

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

export default router;
