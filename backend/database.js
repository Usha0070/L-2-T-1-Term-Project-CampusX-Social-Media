import postgres from "postgres"
import "dotenv/config"

const sql = postgres({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
})

export async function getPostsById(userId) {
    return await sql`SELECT * FROM post WHERE author_id = ${ userId }`
}

export async function getHashedPasswordByStudentId(student_id) {
    const [row] = await sql`SELECT hashed_password FROM "user" WHERE student_id = ${ student_id }`
    return row?.hashed_password || null
}

export async function getUserIdByStudentId(student_id) {
    const [row] = await sql`SELECT user_id FROM "user" WHERE student_id = ${ student_id }` 
    return row?.user_id || null
}