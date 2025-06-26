import sql from "./sql.js";

function convertName(path) {
  const normalized = path.replace(/\\/g, "/");
  const fileName = normalized.split("/").pop();
  return `/media/${fileName}`;
}

export async function createMedia(media, tx = null) {
  const executor = tx || sql;
  const link = convertName(media.link);
  const [row] = await executor`
    INSERT INTO media (link, type)
    VALUES (${link}, ${media.type})
    RETURNING media_id
    `;
  return row.media_id;
}
