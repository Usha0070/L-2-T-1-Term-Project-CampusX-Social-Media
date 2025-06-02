import "dotenv/config";
import express from "express";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";
import groupsRouter from "./routes/groups.js";
import chatsRouter from "./routes/chats.js";
import notificationsRouter from "./routes/notifications.js";

const port = process.env.SERVER_PORT || 5000;
const app = express();
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/groups", groupsRouter);
app.use("/chats", chatsRouter);
app.use("/notifications", notificationsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
