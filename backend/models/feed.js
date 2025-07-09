import sql from "./sql.js";
import { getFriendsByUserId } from "../db/friend.js";

export async function getFeedByUserId(user_id, page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const friendsData = await getFriendsByUserId(user_id);
  const friendIds = friendsData?.friends?.map((f) => f.user_id) || [];

  const groupsResult = await sql.query(
    `SELECT group_id FROM group_member WHERE user_id = $1`,
    [user_id]
  );
  const groupIds = groupsResult.rows.map((g) => g.group_id);

  const queryText = `
    SELECT
      p.post_id,
      p.author_id,
      u.first_name || ' ' || u.last_name AS author_name,
      p.content,
      p.created_at,
      p.modified_at,
      p.visibility,
      p.shared_post_id,
      COUNT(DISTINCT pl.user_id) AS like_count,
      COUNT(DISTINCT pc.comment_id) AS comment_count,
      -- ✅ Fix: use EXISTS instead of BOOL_OR
      EXISTS (
        SELECT 1
        FROM post_like pl2
        WHERE pl2.post_id = p.post_id AND pl2.user_id = $3
      ) AS liked_by_user,
      JSON_AGG(DISTINCT jsonb_build_object(
        'link', m.link,
        'type', m.type,
        'context', pm.context,
        'order_index', pm.order_index
      )) FILTER (WHERE m.media_id IS NOT NULL) AS media
    FROM post p
    LEFT JOIN "user" u ON u.user_id = p.author_id
    LEFT JOIN post_like pl ON pl.post_id = p.post_id
    LEFT JOIN post_comment pc ON pc.post_id = p.post_id
    LEFT JOIN post_media pm ON pm.post_id = p.post_id
    LEFT JOIN media m ON m.media_id = pm.media_id
    WHERE
      (
        p.author_id = ANY($1::int[]) OR
        p.post_id IN (
          SELECT post_id
          FROM group_post
          WHERE group_id = ANY($2::int[])
        ) OR
        p.visibility = 'public'
      )
      AND p.author_id != $3
    GROUP BY p.post_id, u.first_name, u.last_name
    ORDER BY p.created_at DESC
    LIMIT $4 OFFSET $5;
  `;

  const postsResult = await sql.query(queryText, [
    friendIds,
    groupIds,
    user_id,
    limit,
    offset,
  ]);

  return postsResult.rows;
}
