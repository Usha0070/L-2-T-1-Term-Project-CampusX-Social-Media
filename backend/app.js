import express from "express";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";

const port = 5000;
const app = express();
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
