import sql from "./sql.js";

export async function getNotificationsByUserId(user_id, limit = 20, offset = 0) {
  const notifications = await sql`
    SELECT type, sender_id, is_read, created_at, metadata
    FROM notification
    WHERE recipient_id = ${user_id}
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  return notifications;
}
