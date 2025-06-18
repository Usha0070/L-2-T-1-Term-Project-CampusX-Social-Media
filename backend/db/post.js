import sql from "./sql.js";

import { createMedia } from "./media.js";
import { createMarketPost, createTuitionPost } from "./post2.js";
import { createNotification } from "./notification.js";

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

async function insertPostTag(postData, post_id, tx) {
  const post_tags = [
    postData.user_id,
    ...(Array.isArray(postData.tagged_user_ids) ? postData.tagged_user_ids : []),
  ];
  for (const user of post_tags) {
    await tx`
      INSERT INTO post_tag VALUES (${post_id}, ${user})
    `;
  }
}

async function insertPostMedia(postData, post_id, tx) {
  for (const media of postData.post_medias || []) {
    const media_id = await createMedia({ link: media.path, type: "image" });
    const post_media = {
      post_id: post_id,
      media_id: media_id,
      order_index: media.order_index,
      ...(media.context !== undefined && { context: media.context }),
    };
    await tx`
      INSERT INTO post_media ${sql(post_media)}`;
  }
}

export async function createPost(postData) {
  try {
    const result = await sql.begin(async (tx) => {
      const post = {
        ...(postData.post_id && { post_id: postData.post_id }),
        author_id: postData.user_id,
        ...(postData.content && { content: postData.content }),
        visibility: postData.visibility,
        ...(postData.shared_post_id && { shared_post_id: postData.shared_post_id }),
      };
      const [postRow] = await tx`
        INSERT INTO post ${sql(post)}
        RETURNING post_id
      `;
      const post_id = postRow?.post_id;
      if (!post_id) throw new Error("Failed to create post");

      await insertPostTag(postData, post_id, tx);
      await insertPostMedia(postData, post_id, tx);
      if (postData.market) await createMarketPost({ post_id: post_id, ...postData.market }, tx);
      if (postData.tuition) await createTuitionPost({ post_id: post_id, ...postData.tuition }, tx);

      return { success: true, post_id: post_id };
    });
    return result;
  } catch (err) {
    console.log("Error in createPost: ", err);
    return { error: err.message };
  }
}

export async function validateUserPost(user_id, post_id) {
  try {
    const result = await sql`
      SELECT 1 FROM post
      WHERE author_id = ${user_id} AND post_id = ${post_id}
    `;
    return result.length > 0;
  } catch (err) {
    console.log("Error in validateUserPost: ", err);
    return false;
  }
}

export async function updatePost(postData) {
  try {
    const result = await sql.begin(async (tx) => {
      const post = {
        author_id: postData.user_id,
        ...(postData.content && { content: postData.content }),
        modified_at: Date.now(),
        visibility: postData.visibility,
      };

      await tx`
        UPDATE post 
        SET ${sql(post)}
        WHERE post_id = ${postData.post_id}
      `;
      await tx`
        DELETE FROM post_tag WHERE post_id = ${postData.post_id}
      `;
      await insertPostTag(postData, postData.post_id, tx);

      await tx`
        DELETE FROM post_media WHERE post_id = ${postData.post_id}
      `;
      await insertPostMedia(postData, postData.post_id, tx);

      if (postData.market) {
        await tx`
          DELETE FROM marketplace_post WHERE post_id = ${postData.post_id}
        `;
        await createMarketPost({ post_id: postData.post_id, ...postData.market }, tx);
      }

      if (postData.tuition) {
        await tx`
          DELETE FROM tuition_subject WHERE post_id = ${postData.post_id};
        `;
        await tx`
          DELETE FROM tuition_post WHERE post_id = ${postData.post_id};
        `;
        await createTuitionPost({ post_id: postData.post_id, ...postData.tuition }, tx);
      }
      return { success: true, post_id: postData.post_id };
    });
    return result;
  } catch (err) {
    console.log("Error in updatePost: ", err);
    return { error: err.message };
  }
}

async function getUserIdByPostId(post_id) {
  const [row] = await sql`
    SELECT author_id FROM post
    WHERE post_id = ${post_id}
  `;
  return row.author_id;
}

export async function createPostLike(post, liker) {
  await sql`
    INSERT INTO post_like (post_id, user_id)
    VALUES (${post}, ${liker})
  `;
  await createNotification(await getUserIdByPostId(post), user, "post_like", { post_id: post });
}

export async function deletePostLike(post, liker) {
  await sql`
    DELETE FROM post_like
    WHERE post_id = ${post} AND user_id = ${liker}
  `;
}

export async function createPostComment(commentData) {
  const [result] = await sql`
    INSERT INTO post_comment ${sql(commentData)}
    RETURNING comment_id
  `;
  await createNotification(
    await getUserIdByPostId(commentData.post_id),
    commentData.author_id,
    "post_comment",
    { post_id: commentData.post_id, comment_id: result.comment_id }
  );
  return { success: true, comment_id: result.comment_id };
}

export async function validateUserComment(user_id, comment_id) {
  try {
    const result = await sql`
      SELECT 1 FROM post_comment
      WHERE author_id = ${user_id} AND comment_id = ${comment_id}
    `;
    return result.length > 0;
  } catch (err) {
    console.log("Error in validateUserPost: ", err);
    return false;
  }
}

export async function updatePostComment(commentData) {
  try {
    const comment = {
      ...commentData,
      modified_at: Date.now(),
    };
    await sql`
      UPDATE post_comment 
      SET ${sql(comment)}
      WHERE comment_id = ${comment.comment_id}
    `;
    return { success: true, comment_id: parseInt(comment.comment_id) };
  } catch (err) {
    console.log("Error in updatePostComment: ", err);
    return { error: err.message };
  }
}

export async function deletePostComment(comment_id) {
  try {
    await sql`
      DELETE FROM post_comment
      WHERE comment_id = ${comment_id}
    `;
    return { success: true };
  } catch (err) {
    console.log("Error in deletePostComment: ", err);
    return { error: err.message };
  }
}
