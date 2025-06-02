import sql from "./sql.js";

export async function getGroups() {
  const groups = await sql`
    SELECT g.group_id, g.name, g.description, g.created_at, g.creator_id, g.admin_id, 
        m1.link profile_pic, m2.link cover_photo
    FROM "group" g
    JOIN media m1 ON m1.media_id = g.profile_pic
    JOIN media m2 ON m2.media_id = g.cover_photo
  `;
  return groups;
}

export async function getGroupByGroupId(group_id) {
  const [group] = await sql`
    SELECT g.group_id, g.name, g.description, g.created_at, g.creator_id, g.admin_id, 
        m1.link profile_pic, m2.link cover_photo
    FROM "group" g
    JOIN media m1 ON m1.media_id = g.profile_pic
    JOIN media m2 ON m2.media_id = g.cover_photo
    WHERE g.group_id = ${group_id}
  `;
  return group;
}

export async function getGroupModsByGroupId(group_id) {
  const mods = await sql`
    SELECT user_id FROM group_mod WHERE group_id = ${group_id}
  `;
  return mods;
}

export async function getGroupMembersByGroupId(group_id) {
  const members = await sql`
    SELECT user_id FROM group_member WHERE group_id = ${group_id}
  `;
  return members;
}

export async function getGroupPostsByGroupId(group_id) {
  const posts = await sql`
    SELECT post_id, status FROM group_post WHERE group_id = ${group_id}
  `;
  return posts;
}
