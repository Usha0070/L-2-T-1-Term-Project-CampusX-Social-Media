import sql from "./sql.js";

export async function getPostsByUserId(user_id) {
  const posts = await sql`
    SELECT
      p.post_id, p.author_id, p.content, p.created_at, p.modified_at, p.visibility, p.shared_post_id,
      CAST(COUNT(DISTINCT pl.user_id) AS INTEGER) AS like_count,
      CAST(COUNT(DISTINCT pc.comment_id) AS INTEGER) AS comment_count,
      CAST(COUNT(DISTINCT pt_count.user_id) AS INTEGER) AS tag_count,
      CAST((
        SELECT COUNT(*) FROM post shared WHERE shared.shared_post_id = p.post_id
      ) AS INTEGER) AS share_count,
      JSON_AGG(DISTINCT jsonb_build_object(
        'link', m.link,
        'type', m.type,
        'context', pm.context,
        'order_index', pm.order_index
      )) FILTER (WHERE m.media_id IS NOT NULL) AS media
    FROM post p
    JOIN post_tag pt_filter ON pt_filter.post_id = p.post_id AND pt_filter.user_id = ${user_id}
    LEFT JOIN post_tag pt_count ON pt_count.post_id = p.post_id
    LEFT JOIN post_like pl ON p.post_id = pl.post_id
    LEFT JOIN post_comment pc ON p.post_id = pc.post_id
    LEFT JOIN post_media pm ON p.post_id = pm.post_id
    LEFT JOIN media m ON pm.media_id = m.media_id
    GROUP BY p.post_id
    ORDER BY p.created_at DESC;
  `;
  return posts;
}

export async function getPostByPostId(post_id) {
  const [post] = await sql`
    SELECT
      p.post_id, p.author_id, p.content, p.created_at, p.modified_at, p.visibility, p.shared_post_id,

      CASE WHEN mp.post_id IS NOT NULL THEN
        jsonb_build_object(
          'category', mp.category,
          'price', mp.price,
          'status', mp.status,
          'item_condition', mp.item_condition
        )
      ELSE NULL END AS marketplace_post,

      CASE WHEN tp.post_id IS NOT NULL THEN
        jsonb_build_object(
          'class', tp.class,
          'num_students', tp.num_students,
          'remunation', tp.remunation,
          'status', tp.status,
          'preferred_gender', tp.preferred_gender,
          'location', loc.name,
          'subjects', 
            JSON_AGG(DISTINCT jsonb_build_object('name', sub.name))
        )
      ELSE NULL END AS tuition_post,

      JSON_AGG(DISTINCT jsonb_build_object('user_id', pt.user_id))
      FILTER (WHERE pt.user_id IS NOT NULL) AS tags,

      JSON_AGG(DISTINCT jsonb_build_object('user_id', pl.user_id)) 
      FILTER (WHERE pl.user_id IS NOT NULL) AS likes,

      JSON_AGG(DISTINCT jsonb_build_object(
        'comment_id', pc.comment_id,
        'author_id', pc.author_id,
        'content', pc.content,
        'created_at', pc.created_at,
        'modified_at', pc.modified_at,
        'parent_comment_id', pc.parent_comment_id
      )) FILTER (WHERE pc.comment_id IS NOT NULL) AS comments,

      JSON_AGG(DISTINCT jsonb_build_object(
        'link', m.link,
        'type', m.type,
        'context', pm.context,
        'order_index', pm.order_index
      )) FILTER (WHERE m.media_id IS NOT NULL) AS media

    FROM post p
    LEFT JOIN marketplace_post mp ON mp.post_id = p.post_id
    LEFT JOIN tuition_post tp ON tp.post_id = p.post_id
    LEFT JOIN location loc ON loc.location_id = tp.location_id
    LEFT JOIN tuition_subject ts ON ts.post_id = tp.post_id
    LEFT JOIN subject sub ON sub.subject_id = ts.subject_id
    LEFT JOIN post_tag pt ON pt.post_id = p.post_id
    LEFT JOIN post_like pl ON pl.post_id = p.post_id
    LEFT JOIN post_comment pc ON pc.post_id = p.post_id
    LEFT JOIN post_media pm ON pm.post_id = p.post_id
    LEFT JOIN media m ON m.media_id = pm.media_id

    WHERE p.post_id = ${post_id}

    GROUP BY
      p.post_id,
      mp.post_id, mp.category, mp.price, mp.status, mp.item_condition,
      tp.post_id, tp.class, tp.num_students, tp.remunation, tp.status, tp.preferred_gender,
      loc.location_id, loc.name;
  `;
  return post;
}
