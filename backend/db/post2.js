import sql from "./sql.js";

export async function createMarketPost(postData, tx) {
  await tx`
    INSERT INTO marketplace_post ${sql(postData)}
    `;
}

export async function createTuitionPost(postData, tx) {
  const location_name = postData.location;
  const [row] = await tx`
    WITH ins AS (
      INSERT INTO location (name)
      VALUES (${location_name})
      ON CONFLICT (name) DO NOTHING
      RETURNING location_id
    )
    SELECT location_id FROM ins
    UNION
    SELECT location_id FROM location WHERE name ILIKE ${location_name};
    `;
  const location_id = row?.location_id;

  const tuitionPost = {
    post_id: postData.post_id,
    class: postData.class,
    num_students: postData.num_students,
    location_id: location_id,
    remunation: postData.remunation,
    status: postData.status,
    ...(postData.preferred_gender !== undefined && { preferred_gender: postData.preferred_gender }),
  };
  await tx`
    INSERT INTO tuition_post ${sql(tuitionPost)}
  `;

  for (const subject of postData.subjects) {
    const [row2] = await tx`
      WITH ins AS (
        INSERT INTO subject (name)
        VALUES (${subject})
        ON CONFLICT (name) DO NOTHING
        RETURNING subject_id
      )
      SELECT subject_id FROM ins
      UNION
      SELECT subject_id FROM subject WHERE name = ${subject};
    `;

    await tx`
      INSERT INTO tuition_subject VALUES (${postData.post_id}, ${row2.subject_id})
    `;
  }
}
