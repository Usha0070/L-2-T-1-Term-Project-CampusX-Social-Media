import sql from "./sql.js";

export async function getFriendsByUserId(user_id) {
  const [friends] = await sql`
    SELECT jsonb_build_object(
    'friends', JSON_AGG(
        CASE
        WHEN f.status = 'Accepted' THEN jsonb_build_object(
            'user_id', CASE WHEN f.user_id = ${user_id} THEN f.friend_id ELSE f.user_id END,
            'since', f.created_at
        )
        END
    ) FILTER (WHERE f.status = 'Accepted'),

    'friend_requests_sent', JSON_AGG(
        CASE
        WHEN f.status = 'Pending' AND f.action_user_id = ${user_id} THEN jsonb_build_object(
            'user_id', CASE WHEN f.user_id = ${user_id} THEN f.friend_id ELSE f.user_id END,
            'since', f.created_at
        )
        END
    ) FILTER (WHERE f.status = 'Pending' AND f.action_user_id = ${user_id}),

    'friend_requests_received', JSON_AGG(
        CASE
        WHEN f.status = 'Pending' AND f.action_user_id <> ${user_id} THEN jsonb_build_object(
            'user_id', CASE WHEN f.user_id = ${user_id} THEN f.friend_id ELSE f.user_id END,
            'since', f.created_at
        )
        END
    ) FILTER (WHERE f.status = 'Pending' AND f.action_user_id <> ${user_id})
    ) AS result
    FROM friendship f
    WHERE ${user_id} IN (f.user_id, f.friend_id);
    `;
  return friends.result;
}

export async function getFollowsByUserId(user_id) {
  const follows = await sql`
    SELECT followee_id user_id FROM follow WHERE follower_id = ${user_id}
    `;
  return follows;
}

export async function getBlocksByUserId(user_id) {
  const blocks = await sql`
    SELECT blocked_id user_id FROM block WHERE blocker_id = ${user_id}
    `;
  return blocks;
}

export async function getBlockersByUserId(user_id) {
  const blockers = await sql`
    SELECT blocker_id user_id FROM block WHERE blocked_id = ${user_id}
    `;
  return blockers;
}

async function deleteFriend(user1, user2) {
  if (user1 > user2) [user1, user2] = [user2, user1];
  const result = await sql`
    DELETE FROM friendship
    WHERE user_id = ${user1} AND friend_id = ${user2}
    RETURNING user_id
  `;
  if (result.length == 0) throw new Error("Friendship does not exist");
}

async function acceptFriend(user1, user2, action_user) {
  if (user1 > user2) [user1, user2] = [user2, user1];
  const result = await sql`
    UPDATE friendship
    SET action_user_id = ${action_user}, status = 'Accepted'
    WHERE user_id = ${user1} AND friend_id = ${user2} AND action_user_id != ${action_user}
    RETURNING user_id
  `;
  if (result.length == 0) throw new Error("Friendship does not exist");
}

async function createFriend(user1, user2, action_user) {
  if (user1 > user2) [user1, user2] = [user2, user1];
  const result = await sql`
    INSERT INTO friendship (user_id, friend_id, status, action_user_id)
    VALUES (${user1}, ${user2}, 'Pending', ${action_user})
    RETURNING user_id
  `;
  if (result.length == 0) throw new Error("Friendship does not exist");
}

export async function updateFriendship(friendship) {
  try {
    switch (friendship.type) {
      case "unfriend":
      case "req_delete":
        await deleteFriend(friendship.user_id, friendship.friend_id);
        break;

      case "req_accept":
        await acceptFriend(friendship.user_id, friendship.friend_id, friendship.user_id);
        break;

      case "req_sent":
        await createFriend(friendship.user_id, friendship.friend_id, friendship.user_id);
        break;
    }
    return { success: true };
  } catch (err) {
    console.log("Error in updateFriendship: ", err);
    return { error: err.message };
  }
}

async function addFollow(follower, followee) {
  const result = await sql`
    INSERT INTO follow (follower_id, followee_id) 
    VALUES (${follower}, ${followee})
    RETURNING follower_id
  `;
  if (result.length == 0) throw new Error("Follow already exists");
}

async function deleteFollow(follower, followee) {
  const result = await sql`
    DELETE FROM follow
    WHERE follower_id = ${follower} AND followee_id = ${followee}
    RETURNING follower_id
  `;
  if (result.length == 0) throw new Error("Follow does not exist");
}

export async function updateFollow(follow) {
  try {
    switch (follow.type) {
      case "add":
        await addFollow(follow.user_id, follow.followed_id);
        break;

      case "delete":
        await deleteFollow(follow.user_id, follow.followed_id);
        break;
    }
    return { success: true };
  } catch (err) {
    console.log("Error in updateFollow: ", err);
    return { error: err.message };
  }
}

async function addBlock(blocker, blocked) {
  const result = await sql`
    INSERT INTO block (blocker_id, blocked_id) 
    VALUES (${blocker}, ${blocked})
    RETURNING blocker_id
  `;
  if (result.length == 0) throw new Error("Follow already exists");
}

async function deleteBlock(blocker, blocked) {
  const result = await sql`
    DELETE FROM block
    WHERE blocker_id = ${blocker} AND blocked_id = ${blocked}
    RETURNING blocker_id
  `;
  if (result.length == 0) throw new Error("Block does not exist");
}

export async function updateBlock(block) {
  try {
    switch (block.type) {
      case "add":
        await addBlock(block.user_id, block.blocked_id);
        break;

      case "delete":
        await deleteBlock(block.user_id, block.blocked_id);
        break;
    }
    return { success: true };
  } catch (err) {
    console.log("Error in updateBlock: ", err);
    return { error: err.message };
  }
}
