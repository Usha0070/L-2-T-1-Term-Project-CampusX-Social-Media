import express from "express";
import postsRouter from "./routes/posts.js";
import loginRouter from "./routes/login.js";

const port = 5000;
const app = express();
app.use(express.json());

app.use("/login", loginRouter);
app.use("/posts", postsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
