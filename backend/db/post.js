import sql from "./sql.js";

export async function getPostsById(userId) {
  return await sql`SELECT * FROM post WHERE author_id = ${userId}`;
}
