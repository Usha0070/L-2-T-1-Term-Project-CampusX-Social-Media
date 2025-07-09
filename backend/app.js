import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import z from "zod";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js"; // <-- This is postRoutes
import groupsRouter from "./routes/groups.js";
import chatsRouter from "./routes/chats.js";
import notificationsRouter from "./routes/notifications.js";
import feedRouter from "./routes/feed.js";
import commentsRouter from "./routes/comments.js";
import { authenticate } from "./middleware/auth.js";

const port = process.env.SERVER_PORT || 5000;
const app = express();

// 🧭 Setup __dirname for ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🌐 Enable CORS for frontend access
app.use(cors({
  origin: 'http://localhost:5173', // adjust based on your frontend port
  credentials: true,
}));

// 🧾 Middleware to parse JSON bodies
app.use(express.json());

// 📂 Serve static media files from /meta/media
app.use('/media', express.static(path.join(__dirname, '../meta/media')));

// 🔌 Mount routes
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);      // handles /posts endpoints
app.use("/groups", groupsRouter);
app.use("/chats", chatsRouter);
app.use("/notifications", notificationsRouter);
app.use("/api/feed", authenticate, feedRouter);
app.use("/api/post", postsRouter);   // handles /api/post/:id/likes, etc.
app.use("/api/comments", commentsRouter);

// ⚠️ Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof z.ZodError) {
    res.status(err.status || 400).json({ error: err.errors });
  } else {
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
  }
});

// ❌ Catch-all 404 route
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// 🚀 Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
