import express from "express"
import * as db from "./database.js"

const app = express()
const port = 5000

app.get('/actor', async (req, res) => {
    const data = await db.getActors()
    res.send(data)
})

app.get('/actor/:id', async (req, res) => {
    const { id } = req.params
    const data = await db.getActor(id)
    res.send(data)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
