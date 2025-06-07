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
    SELECT m.message_id, m.sender_id, m.content, m.sent_at, m.is_read
    FROM message m
    WHERE m.chat_id = ${chat_id}
    ORDER BY m.sent_at
    `;
  return chat;
}

export async function createChat(chatData) {
  try {
    if (chatData.user1_id > chatData.user2_id) {
      var t = chatData.user1_id;
      chatData.user1_id = chatData.user2_id;
      chatData.user2_id = t;
    }
    const [row] = await sql`
      INSERT INTO chat ${sql(chatData)}
      RETURNING chat_id
    `;
    if (!row.chat_id) throw new Error("Chat not created");
    return { success: true, chat_id: row.chat_id };
  } catch (err) {
    console.log("Error in createChat: ", err);
    return { error: err.message };
  }
}

export async function validateUserChat(user_id, chat_id) {
  try {
    const result = await sql`
      SELECT 1 FROM chat
      WHERE chat_id = ${chat_id} AND
        (user1_id = ${user_id} OR user2_id = ${user_id})
    `;
    return result.length > 0;
  } catch (err) {
    console.log("Error in validateUserChat: ", err);
    return false;
  }
}

export async function createMessage(messageData) {
  try {
    const [row] = await sql`
      INSERT INTO message ${sql(messageData)}
      RETURNING message_id
    `;
    if (!row.message_id) throw new Error("Message not created");
    return { success: true, message_id: row.message_id };
  } catch (err) {
    console.log("Error in createMessage: ", err);
    return { error: err.message };
  }
}

export async function modifyMessage(messageData) {
  try {
    await sql`
      UPDATE message 
      SET ${sql(messageData)}
      WHERE message_id = ${messageData.message_id}
    `;
    return { success: true };
  } catch (err) {
    console.log("Error in modifyMessage: ", err);
    return { error: err.message };
  }
}

export async function deleteMessage(message_id) {
  try {
    await sql`
      DELETE FROM message
      WHERE message_id = ${message_id}
    `;
    return { success: true };
  } catch (err) {
    console.log("Error in deleteMessage: ", err);
    return { error: err.message };
  }
}
