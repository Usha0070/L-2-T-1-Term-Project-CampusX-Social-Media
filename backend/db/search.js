import sql from "./sql.js";
import { getUserByUserId } from "./user.js";
import { getPostByPostId } from "./post.js";
import { getGroupByGroupId } from "./group.js";

export async function search(query, options = {}) {
  const { limit = 10, filters = ["users", "groups", "posts"] } = options;
  const searchQuery = `%${query}%`;
  const results = {};

  if (filters.includes("users")) {
    const userQuery = `
      SELECT user_id
      FROM "user" u
      WHERE 
        LOWER(first_name) LIKE LOWER($1) OR
        LOWER(last_name) LIKE LOWER($1) OR
        LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER($1) OR
        LOWER(nickname) LIKE LOWER($1) OR
        student_id LIKE $1
      LIMIT $2
    `;
    const userIds = await sql.unsafe(userQuery, [searchQuery, limit]);
    results.users = await Promise.all(userIds.map(({ user_id }) => getUserByUserId(user_id)));
  }

  if (filters.includes("groups")) {
    const groupQuery = `
      SELECT group_id
      FROM "group" g
      WHERE 
        (LOWER(name) LIKE LOWER($1) OR
        LOWER(description) LIKE LOWER($1))
        AND is_public = true
      LIMIT $2
    `;
    const groupIds = await sql.unsafe(groupQuery, [searchQuery, limit]);
    results.groups = await Promise.all(groupIds.map(({ group_id }) => getGroupByGroupId(group_id)));
  }

  if (filters.includes("posts")) {
    const postQuery = `
      SELECT post_id
      FROM post p
      WHERE 
        LOWER(content) LIKE LOWER($1) AND
        visibility = 'public'
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const postIds = await sql.unsafe(postQuery, [searchQuery, limit]);
    results.posts = await getPostByPostId(postIds.map(({ post_id }) => post_id));
  }

  return results;
}
