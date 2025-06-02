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
