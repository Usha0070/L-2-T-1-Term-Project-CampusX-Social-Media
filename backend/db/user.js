import sql from "./sql.js";

export async function getHashedPasswordByStudentId(student_id) {
  const [row] = await sql`SELECT hashed_password FROM "user" WHERE student_id = ${student_id}`;
  return row?.hashed_password || null;
}

export async function getUserIdByStudentId(student_id) {
  const [row] = await sql`SELECT user_id FROM "user" WHERE student_id = ${student_id}`;
  return row?.user_id || null;
}

export async function getUserByUserId(user_id) {
  const [user] = await sql`
    SELECT first_name, last_name, nickname, student_id, batch, department, email, phone,
      date_of_birth, gender, type AS residence_type, hall, room_no, name AS city_name 
    FROM "user"
    JOIN address ON address.address_id = "user".address_id 
    JOIN city ON city.city_id = address.city_id 
    WHERE user_id = ${user_id}
    `;
  if (user?.date_of_birth instanceof Date) {
    user.date_of_birth = user.date_of_birth.toISOString().split("T")[0];
  }
  return user;
}

export async function createUser(user) {
  try {
    const result = await sql.begin(async (tx) => {
      const [cityRow] = await tx`
        SELECT city_id FROM city WHERE name ILIKE ${user.city_name}
      `;
      const city_id = cityRow?.city_id;
      if (!city_id) {
        throw new Error("City name not found");
      }

      const [addressRow] = await tx`
        INSERT INTO address (
          type, hall, room_no, city_id
        )
        VALUES (
          ${user.residence_type}, ${user.hall}, ${user.room_no}, ${city_id}
        )
        RETURNING address_id
      `;
      const address_id = addressRow?.address_id;
      if (!address_id) {
        throw new Error("Failed to insert address");
      }

      const [userRow] = await tx`
        INSERT INTO "user" (
          first_name, last_name, nickname, student_id, batch, department,
          email, phone, hashed_password, date_of_birth, gender, address_id
        )
        VALUES (
          ${user.first_name}, ${user.last_name}, ${user.nickname}, ${user.student_id},
          ${user.batch}, ${user.department}, ${user.email}, ${user.phone},
          ${user.hashed_password}, ${user.date_of_birth}, ${user.gender}, ${address_id}
        )
        RETURNING user_id
      `;

      return { success: true, user_id: userRow.user_id };
    });

    return result;
  } catch (err) {
    console.error("Error in createUser:", err.message);
    return { error: err.message || "Unknown database error" };
  }
}
