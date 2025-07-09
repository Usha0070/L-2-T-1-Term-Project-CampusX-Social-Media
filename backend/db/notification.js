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

// export async function createNotification(recipient_id, sender_id, type, metadata) {
//   try {
//     const [row] = await sql`
//       INSERT INTO notification (type, recepient_id, sender_id, metadata)
//       VALUES (${type}, ${recipient_id}, ${sender_id}, ${metadata})
//       RETURNING notification_id
//     `;
//     if (!row.notification_id) throw new Error("Notification not created");
//     return { seccess: true, notification_id: row.notification_id };
//   } catch (err) {
//     console.log("Error in createNotification: ", err);
//     return { error: err.message };
//   }
// }
