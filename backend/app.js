import "dotenv/config";
import express from "express";
import cors from "cors";
import z from "zod";

import { authenticate, authenticateAdmin } from "./middleware/auth.js";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";
import groupsRouter from "./routes/groups.js";
import chatsRouter from "./routes/chats.js";
import notificationsRouter from "./routes/notifications.js";
import statsRouter from "./routes/stats.js";

const port = process.env.SERVER_PORT || 5000;
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", authenticate, usersRouter);
app.use("/posts", authenticate, postsRouter);
app.use("/groups", authenticate, groupsRouter);
app.use("/chats", authenticate, chatsRouter);
app.use("/notifications", authenticate, notificationsRouter);
app.use("/stats", authenticate, authenticateAdmin, statsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof z.ZodError) {
    res.status(err.status || 400).json({ error: err.errors });
  } else {
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
