import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as db from "../database.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { student_id, password } = req.body;
  if (!student_id || !password) {
    return res.status(400).json({ error: "Missing student_id or password" });
  }

  const hashed = await db.getHashedPasswordByStudentId(student_id);
  if (!hashed) {
    return res.status(401).json({ error: "Invalid credentials " });
  }

  const result = await bcrypt.compare(password, hashed);
  if (!result) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user_id = await db.getUserIdByStudentId(student_id);
  const user = { user_id };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN);
  res.status(200).json({ accessToken });
});

export default router;
