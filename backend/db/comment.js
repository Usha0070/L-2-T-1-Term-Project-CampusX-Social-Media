// db/comment.js
import sql from "./sql.js";

export async function getCommentsByPostId(post_id) {
  return await sql`
    SELECT 
      c.comment_id,
      c.content,
      c.author_id,
      c.created_at,
      c.parent_comment_id,
      u.nickname
    FROM post_comment c
    LEFT JOIN "user" u ON c.author_id = u.user_id
    WHERE c.post_id = ${post_id}
    ORDER BY c.created_at ASC
  `;
}


export async function createComment({ post_id, author_id, content, parent_comment_id = null }) {
  const [row] = await sql`
    INSERT INTO post_comment (post_id, author_id, content, parent_comment_id)
    VALUES (${post_id}, ${author_id}, ${content}, ${parent_comment_id})
    RETURNING comment_id, content, author_id, created_at, parent_comment_id
  `;
  return row;
}
