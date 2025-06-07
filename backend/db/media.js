import sql from "./sql.js";

export async function createMedia(media) {
  const [row] = await sql`
    INSERT INTO media (link, type)
    VALUES (${media.link}, ${media.type})
    RETURNING media_id
    `;
  return row.media_id;
}
