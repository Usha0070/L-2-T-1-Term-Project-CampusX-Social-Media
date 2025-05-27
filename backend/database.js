import postgres from "postgres"
import "dotenv/config"

const sql = postgres({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
})

async function getActors() {
    const actors = await sql`SELECT * FROM actor`
    return actors
}

async function getActor(id) {
    const actor = await sql`SELECT * FROM actor WHERE actor_id = ${ id };`
    return actor[0]
}

export { getActor, getActors }

// var actors = await getActors();
// console.log(actors)
// var actor = await getActor(1)
// console.log(actor)