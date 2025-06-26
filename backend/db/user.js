import sql from "./sql.js";
import { createMedia } from "./media.js";

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

export async function getUserProfileByUserId(user_id) {
  const [profile] = await sql`
    SELECT bio, about, m1.link profile_pic, m2.link cover_photo
    FROM user_profile
    LEFT JOIN media m1 ON profile_pic = m1.media_id
    LEFT JOIN media m2 ON cover_photo = m2.media_id
    WHERE user_id = ${user_id}
  `;
  return profile;
}

export async function createUser(user) {
  try {
    const result = await sql.begin(async (tx) => {
      const [cityRow] = await tx`
        SELECT city_id FROM city WHERE name ILIKE ${user.city_name}
      `;
      const city_id = cityRow?.city_id;
      if (!city_id) throw new Error("City name not found");

      const addressData = {
        ...(user.residence_type && { type: user.residence_type }),
        ...(user.hall && { hall: user.hall }),
        ...(user.room_no && { room_no: user.room_no }),
        city_id,
      };

      const [addressRow] = await tx`
        INSERT INTO address 
        ${sql(addressData)}
        RETURNING address_id
      `;
      const address_id = addressRow?.address_id;
      if (!address_id) throw new Error("Failed to insert address");

      const userData = {
        ...(user.first_name && { first_name: user.first_name }),
        ...(user.last_name && { last_name: user.last_name }),
        ...(user.nickname && { nickname: user.nickname }),
        ...(user.student_id && { student_id: user.student_id }),
        ...(user.batch && { batch: user.batch }),
        ...(user.department && { department: user.department }),
        ...(user.email && { email: user.email }),
        ...(user.phone && { phone: user.phone }),
        ...(user.hashed_password && { hashed_password: user.hashed_password }),
        ...(user.date_of_birth && { date_of_birth: user.date_of_birth }),
        ...(user.gender && { gender: user.gender }),
        address_id,
      };

      const [userRow] = await tx`
        INSERT INTO "user" 
        ${sql(userData)}
        RETURNING user_id
      `;

      // ------------------------
      // convert to trigger
      await tx`
        INSERT INTO user_profile (user_id)
        VALUES (${userRow.user_id})
      `;

      await tx`
        INSERT INTO group_member (group_id, user_id)
        VALUES (4, ${userRow.user_id}), (5, ${userRow.user_id})
      `;
      // ---------------------

      return { success: true, user_id: userRow.user_id };
    });

    return result;
  } catch (err) {
    console.error("Error in createUser:", err.message);
    return { error: err.message || "Unknown database error" };
  }
}

export async function updateUser(user) {
  try {
    const result = await sql.begin(async (tx) => {
      let address_id, city_id;

      const [addressRow] = await tx`
          SELECT address_id FROM "user" WHERE user_id = ${user.user_id}
        `;
      address_id = addressRow?.address_id;

      const [cityRow] = await tx`
          SELECT city_id FROM city WHERE name ILIKE ${user.city_name}
        `;
      city_id = cityRow?.city_id;
      if (!city_id) throw new Error("City name not found");

      const addressUpdates = {
        ...(user.residence_type && { type: user.residence_type }),
        ...(user.hall && { hall: user.hall }),
        ...(user.room_no && { room_no: user.room_no }),
        ...(city_id && { city_id }),
      };

      await tx`
          UPDATE address
          SET ${sql(addressUpdates)}
          WHERE address_id = ${address_id}
        `;

      const userUpdates = {
        ...(user.first_name && { first_name: user.first_name }),
        ...(user.last_name && { last_name: user.last_name }),
        ...(user.nickname && { nickname: user.nickname }),
        ...(user.student_id && { student_id: user.student_id }),
        ...(user.batch && { batch: user.batch }),
        ...(user.department && { department: user.department }),
        ...(user.email && { email: user.email }),
        ...(user.phone && { phone: user.phone }),
        ...(user.hashed_password && { hashed_password: user.hashed_password }),
        ...(user.date_of_birth && { date_of_birth: user.date_of_birth }),
        ...(user.gender && { gender: user.gender }),
      };

      await tx`
        UPDATE "user"
        SET ${sql(userUpdates)}
        WHERE user_id = ${user.user_id}
      `;

      return { success: true };
    });
    return result;
  } catch (err) {
    console.error("Error in updateUser:", err.message);
    return { error: err.message || "Unknown database error" };
  }
}

export async function updateUserProfile(profile) {
  try {
    const result = await sql.begin(async (tx) => {
      let profile_pic, cover_photo;
      if (profile.profile_pic)
        profile_pic = await createMedia({ link: profile.profile_pic, type: "image" }, tx);
      if (profile.cover_photo)
        cover_photo = await createMedia({ link: profile.cover_photo, type: "image" }, tx);

      const updates = {
        ...(profile.bio && { bio: profile.bio }),
        ...(profile.about && { about: profile.about }),
        ...(profile_pic && { profile_pic: profile_pic }),
        ...(cover_photo && { cover_photo: cover_photo }),
      };

      await tx`
        UPDATE user_profile
        SET ${sql(updates)}
        WHERE user_id = ${profile.user_id}
      `;

      return { success: true };
    });
    return result;
  } catch (err) {
    console.error("Error in updateUserProfile:", err.message);
    return { error: err.message || "Unknown database error" };
  }
}
