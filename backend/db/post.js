import sql from "./sql.js";

import { createMedia } from "./media.js";
import { createMarketPost, createTuitionPost } from "./post2.js";
import { createNotification } from "./notification.js";
import { getFriendsByUserId } from "./friend.js";

export async function getPostByPostId(post_id) {
  const postIds = Array.isArray(post_id) ? post_id : [post_id];
  // using sql function
  const [result] = await sql`
    SELECT get_posts_by_ids(ARRAY[${sql.array(postIds)}]::int[]) AS posts
  `;
  return result.posts;
}

export async function getPostsByUserId(user_id) {
  const ids = await sql`
    SELECT post_id FROM post_tag
    WHERE user_id = ${user_id}
  `;
  const posts = await getPostByPostId(ids.map((id) => id.post_id));
  return posts;
}

export async function getFeedByUserId(user_id) {
  const friends = await getFriendsByUserId(user_id);
  const userIds = [...friends.friends.map((friend) => friend.user_id), user_id];
  const ids = await sql`
    SELECT DISTINCT post_id FROM post_tag
    WHERE user_id = ANY(${userIds})
  `;
  const posts = await getPostByPostId(ids.map((id) => id.post_id));
  return posts;
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
