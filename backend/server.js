import "dotenv/config"
import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import * as db from "./database.js"

const app = express()
app.use(express.json())
const port = 5000

app.get('/post', authenticate, async (req, res) => {
  try {
    const user_id = req.user.user_id
    const posts = await db.getPostsById(user_id)
    res.status(200).json(posts)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

app.post('/login', async (req, res) => {
  const { student_id, password } = req.body
  if (!student_id || !password) {
    return res.status(400).json({ error: 'Missing student_id or password' })
  }

  const hashed = await db.getHashedPasswordByStudentId(student_id)
  if (!hashed) {
    return res.status(401).json({ error: 'Invalid credentials '})
  }

  const result = await bcrypt.compare(password, hashed)
  if (!result) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const user_id = await db.getUserIdByStudentId(student_id)
  const user = { user_id }

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN)
  res.status(200).json({ accessToken })
})

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Token missing' })
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
