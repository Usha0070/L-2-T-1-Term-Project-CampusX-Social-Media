import sql from "./sql.js";

export async function getChatsByUserId(user_id) {
  const chats = await sql`
    SELECT chat_id, last_message_at,
    CASE
        WHEN user1_id = ${user_id} THEN user2_id ELSE user1_id
    END AS partner_id
    FROM chat
    WHERE user1_id = ${user_id} OR user2_id = ${user_id}
    `;
  return chats;
}

export async function checkUserIdChatId(user_id, chat_id) {
  const result = await sql`
    SELECT 1 FROM chat
    WHERE chat_id = ${chat_id} AND (user1_id = ${user_id} OR user2_id = ${user_id})
    `;
  return result;
}

export async function getChatByChatId(chat_id) {
  const chat = await sql`
    SELECT m.sender_id, m.content, m.sent_at, m.is_read
    FROM message m
    WHERE m.chat_id = ${chat_id}
    ORDER BY m.sent_at
    `;
  return chat;
}
