import sql from "./sql.js";
import { createMedia } from "./media.js";

export async function getGroups() {
  const groups = await sql`
    SELECT g.group_id, g.name, g.description, g.created_at, g.creator_id, g.admin_id, 
        m1.link profile_pic, m2.link cover_photo
    FROM "group" g
    LEFT JOIN media m1 ON m1.media_id = g.profile_pic
    LEFT JOIN media m2 ON m2.media_id = g.cover_photo
  `;
  return groups;
}

export async function getGroupsJoinedByUserId(user_id) {
  const groups = await sql`
    SELECT group_id FROM group_member WHERE user_id = ${user_id}
  `;
  return groups;
}

export async function getGroupByGroupId(group_id) {
  const [group] = await sql`
    SELECT g.group_id, g.name, g.description, g.created_at, g.creator_id, g.admin_id, 
        m1.link profile_pic, m2.link cover_photo
    FROM "group" g
    LEFT JOIN media m1 ON m1.media_id = g.profile_pic
    LEFT JOIN media m2 ON m2.media_id = g.cover_photo
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

export async function createGroup(groupData) {
  try {
    let profile_pic, cover_photo;
    if (groupData.profile_pic)
      profile_pic = await createMedia({ link: groupData.profile_pic, type: "image" });
    if (groupData.cover_photo)
      cover_photo = await createMedia({ link: groupData.cover_photo, type: "image" });

    const group = {
      ...Object.fromEntries(
        Object.entries(groupData).filter(([k, _]) => k !== "profile_pic" && k !== "cover_photo")
      ),
      ...(profile_pic !== undefined && { profile_pic }),
      ...(cover_photo !== undefined && { cover_photo }),
    };

    const [row] = await sql`
      INSERT INTO "group" 
      ${sql(group)}
      RETURNING group_id
    `;
    if (!row.group_id) throw new Error("Group not created");

    return { success: true, group_id: row.group_id };
  } catch (err) {
    console.log("Error in createGroup: ", err);
    return { error: err.message };
  }
}

export async function validateUserGroupMod(user_id, group_id) {
  try {
    const res = await sql`
      SELECT 1 FROM group_mod
      WHERE user_id = ${user_id} AND group_id = ${group_id}
    `;
    return res.length > 0;
  } catch (err) {
    console.error("Error in validateUserGroupMod: ", err);
    return { error: err.message };
  }
}

export async function validateUserGroupMember(user_id, group_id) {
  try {
    const res = await sql`
      SELECT 1 FROM group_member
      WHERE user_id = ${user_id} AND group_id = ${group_id}
    `;
    return res.length > 0;
  } catch (err) {
    console.error("Error in validateUserGroupMember: ", err);
    return { error: err.message };
  }
}

export async function validateUserGroupPost(user_id, group_id, post_id) {
  try {
    const res = await sql`
      SELECT 1
      FROM group_post gp
      JOIN "group" g ON g.group_id = gp.group_id
      JOIN post p ON gp.post_id = p.post_id
      WHERE p.author_id = ${user_id} AND p.post_id = ${post_id} AND g.group_id = ${group_id}
    `;
    return res.length > 0;
  } catch (err) {
    console.error("Error in validateUserGroupPost: ", err);
    return { error: err.message };
  }
}

export async function modifyGroup(groupData) {
  try {
    let profile_pic, cover_photo;
    if (groupData.profile_pic)
      profile_pic = await createMedia({ link: groupData.profile_pic, type: "image" });
    if (groupData.cover_photo)
      cover_photo = await createMedia({ link: groupData.cover_photo, type: "image" });

    const group = {
      ...Object.fromEntries(
        Object.entries(groupData).filter(
          ([k, _]) => k !== "profile_pic" && k !== "cover_photo" && k !== "group_id"
        )
      ),
      ...(profile_pic && { profile_pic }),
      ...(cover_photo && { cover_photo }),
    };

    await sql`
      UPDATE "group"
      SET ${sql(group)}
      WHERE group_id = ${groupData.group_id}
      `;
    return { success: true, group_id: groupData.group_id };
  } catch (err) {
    console.log("Error in modifyGroup: ", err);
    return { error: err.message };
  }
}

export async function createGroupMod(modData) {
  try {
    await sql`
      INSERT INTO group_mod
      ${sql(modData)}
    `;
    return { success: true };
  } catch (err) {
    console.log("Error in createGroupMod: ", err);
    return { error: err.message };
  }
}

export async function deleteGroupMod(modData) {
  try {
    await sql`
      DELETE FROM group_mod
      WHERE group_id = ${modData.group_id} AND user_id = ${modData.user_id}
    `;
    return { success: true };
  } catch (err) {
    console.log("Error in deleteGroupMod: ", err);
    return { error: err.message };
  }
}

export async function createGroupMember(memberData) {
  try {
    await sql`
      INSERT INTO group_member
      ${sql(memberData)}
    `;
    return { success: true };
  } catch (err) {
    console.log("Error in createGroupMember: ", err);
    return { error: err.message };
  }
}

export async function deleteGroupMember(memberData) {
  try {
    await sql`
      DELETE FROM group_member
      WHERE group_id = ${memberData.group_id} AND user_id = ${memberData.user_id}
    `;
    return { success: true };
  } catch (err) {
    console.log("Error in deleteGroupMember: ", err);
    return { error: err.message };
  }
}

export async function createGroupPost(postData) {
  try {
    await sql`
      INSERT INTO group_post
      VALUES (${postData.post_id}, ${postData.group_id}, 'Pending')
    `;
    return { success: true };
  } catch (err) {
    console.log("Error in createGroupPost: ", err);
    return { error: err.message };
  }
}

export async function modifyGroupPost(postData) {
  try {
    await sql`
      UPDATE group_post
      SET status = ${postData.status}
      WHERE group_id = ${postData.group_id} AND post_id = ${postData.post_id}
    `;
    return { success: true };
  } catch (err) {
    console.log("Error in modifyGroupPost: ", err);
    return { error: err.message };
  }
}

export async function deleteGroupPost(postData) {
  try {
    await sql`
      DELETE FROM group_post
      WHERE group_id = ${postData.group_id} AND post_id = ${postData.post_id}
    `;
    return { success: true };
  } catch (err) {
    console.log("Error in deleteGroupPost: ", err);
    return { error: err.message };
  }
}
