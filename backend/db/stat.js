import sql from "./sql.js";

export async function getUserJoined(params) {
  try {
    const metric = params.metric || "hall"; //        hall | department
    const period = params.period || "30 day"; //      30 day | 3 month | 1 year

    const column = metric === "hall" ? "a.hall" : "u.department";

    const query = `
      SELECT ${column} AS group_value, COUNT(*) AS user_count
      FROM "user" u
      JOIN address a ON u.address_id = a.address_id
      WHERE u.created_at >= NOW() - INTERVAL '${period}'
      GROUP BY ${column}
      ORDER BY user_count DESC;
    `;

    const result = await sql.unsafe(query);
    return result;
  } catch (err) {
    console.error("Error in getUserJoined:", err.message);
    return { error: err.message };
  }
}

export async function getTopPosts(params) {
  try {
    const metric = params.metric || "like"; //        like | comment | share | tag | all
    const period = params.period || "30 day"; //      30 day | 3 month | 1 year
    const limit = params.limit || 10; // 10

    const INTERVAL_SQL = `NOW() - INTERVAL '${period}'`;

    const subqueries = {
      like: `
        SELECT post_id, COUNT(*) AS cnt, 'like' AS type
        FROM post_like
        WHERE created_at >= ${INTERVAL_SQL}
        GROUP BY post_id
      `,
      comment: `
        SELECT post_id, COUNT(*) AS cnt, 'comment' AS type
        FROM post_comment
        WHERE created_at >= ${INTERVAL_SQL}
        GROUP BY post_id
      `,
      share: `
        SELECT shared_post_id AS post_id, COUNT(*) AS cnt, 'share' AS type
        FROM post
        WHERE shared_post_id IS NOT NULL AND created_at >= ${INTERVAL_SQL}
        GROUP BY shared_post_id
      `,
      tag: `
        SELECT post_id, COUNT(*) AS cnt, 'tag' AS type
        FROM post_tag
        GROUP BY post_id
      `,
    };

    let activeSubqueries = [];

    if (metric === "all") {
      activeSubqueries = Object.values(subqueries);
    } else {
      activeSubqueries = [subqueries[metric]];
    }

    const unioned = activeSubqueries.join("\nUNION ALL\n");

    const finalQuery = `
      WITH interactions AS (
        ${unioned}
      ),
      post_scores AS (
        SELECT post_id,
          SUM(CASE WHEN type = 'like' THEN cnt ELSE 0 END) AS like_count,
          SUM(CASE WHEN type = 'comment' THEN cnt ELSE 0 END) AS comment_count,
          SUM(CASE WHEN type = 'share' THEN cnt ELSE 0 END) AS share_count,
          SUM(CASE WHEN type = 'tag' THEN cnt ELSE 0 END) AS tag_count,
          SUM(cnt) AS total_score
        FROM interactions
        GROUP BY post_id
      )
      SELECT p.post_id, p.author_id, ps.*
      FROM post_scores ps
      JOIN post p ON p.post_id = ps.post_id
      ORDER BY ps.total_score DESC
      LIMIT ${limit};
    `;

    const result = await sql.unsafe(finalQuery);
    return result;
  } catch (err) {
    console.error("Error in getTopPosts: ", err.message);
    return { error: err.message };
  }
}

export async function getActiveUsers(params) {
  try {
    const hall = params.hall || "all"; //               all | hall_enum
    const department = params.department || "all"; //   all | dept_enum
    const period = params.period || "30 day"; //        30 day | 3 month | 1 year
    const limit = params.limit || "10"; //              10
    const metric = params.metric || "all"; //           post | like | comment | all

    const filters = [];

    if (hall !== "all") {
      filters.push(`a.hall = '${hall}'`);
    }

    if (department !== "all") {
      filters.push(`u.department = '${department}'`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    const intervalClause = `NOW() - INTERVAL '${period}'`;

    const subqueries = {
      post: `
        SELECT author_id AS user_id, COUNT(*) AS cnt, 'post' AS type
        FROM post
        WHERE created_at >= ${intervalClause}
        GROUP BY author_id
      `,
      like: `
        SELECT user_id, COUNT(*) AS cnt, 'like' AS type
        FROM post_like
        WHERE created_at >= ${intervalClause}
        GROUP BY user_id
      `,
      comment: `
        SELECT author_id AS user_id, COUNT(*) AS cnt, 'comment' AS type
        FROM post_comment
        WHERE created_at >= ${intervalClause}
        GROUP BY author_id
      `,
    };

    const activeSubqueries =
      metric === "all" ? [subqueries.post, subqueries.like, subqueries.comment] : [subqueries[metric]];

    const unioned = activeSubqueries.join("\nUNION ALL\n");

    const query = `
      WITH activity AS (
        ${unioned}
      ),
      score_by_user AS (
        SELECT user_id,
          SUM(CASE WHEN type = 'post' THEN cnt ELSE 0 END) AS post_count,
          SUM(CASE WHEN type = 'like' THEN cnt ELSE 0 END) AS like_count,
          SUM(CASE WHEN type = 'comment' THEN cnt ELSE 0 END) AS comment_count,
          SUM(cnt) AS total_score
        FROM activity
        GROUP BY user_id
      )
      SELECT u.user_id, u.first_name, u.last_name, u.department, a.hall,
        s.post_count, s.like_count, s.comment_count, s.total_score
      FROM score_by_user s
      JOIN "user" u ON u.user_id = s.user_id
      JOIN address a ON u.address_id = a.address_id
      ${whereClause}
      ORDER BY s.total_score DESC
      LIMIT ${limit};
    `;

    const result = await sql.unsafe(query);
    return result;
  } catch (err) {
    console.error("Error in getActiveUsers: ", err.message);
    return { error: err.message };
  }
}

export async function getActiveGroups(params) {
  try {
    const period = params.period || "30 day"; //        30 day | 3 month | 1 year
    const limit = params.limit || 10; //                10
    const metric = params.metric || "all"; //           member | post | all

    const intervalClause = `NOW() - INTERVAL '${period}'`;

    const subqueries = {
      member: `
        SELECT group_id, COUNT(*) AS cnt, 'member' AS type
        FROM group_member
        WHERE joined_at >= ${intervalClause}
        GROUP BY group_id
      `,
      post: `
        SELECT group_id, COUNT(*) AS cnt, 'post' AS type
        FROM group_post gp
        JOIN post p ON gp.post_id = p.post_id
        WHERE p.created_at >= ${intervalClause}
        GROUP BY group_id
      `,
    };

    const selectedSubqueries = metric === "all" ? [subqueries.member, subqueries.post] : [subqueries[metric]];

    const unioned = selectedSubqueries.join("\nUNION ALL\n");

    const query = `
      WITH activity AS (
        ${unioned}
      ),
      score_by_group AS (
        SELECT group_id,
          SUM(CASE WHEN type = 'member' THEN cnt ELSE 0 END) AS new_members,
          SUM(CASE WHEN type = 'post' THEN cnt ELSE 0 END) AS posts,
          SUM(cnt) AS total_score
        FROM activity
        GROUP BY group_id
      )
      SELECT g.group_id, g.name, g.description,
        s.new_members, s.posts, s.total_score
      FROM score_by_group s
      JOIN "group" g ON g.group_id = s.group_id
      ORDER BY s.total_score DESC
      LIMIT ${limit};
    `;

    const result = await sql.unsafe(query);
    return result;
  } catch (err) {
    console.error("Error in getActiveGroups:", err.message);
    return { error: err.message };
  }
}

export async function getTrends(params) {
  try {
    const period = params.period || "month"; //     day | week | month | year
    const metric = params.metric || "post"; //      post | friendship | message

    const tableMap = {
      post: {
        table: "post",
        dateColumn: "created_at",
        countAlias: "post_count",
        condition: "",
      },
      friendship: {
        table: "friendship",
        dateColumn: "created_at",
        countAlias: "friendship_count",
        condition: "WHERE status = 'Accepted'",
      },
      message: {
        table: "message",
        dateColumn: "sent_at",
        countAlias: "message_count",
        condition: "",
      },
    };

    const { table, dateColumn, countAlias, condition } = tableMap[metric];

    const query = `
      SELECT
        date_trunc('${period}', ${dateColumn}) AS period_start,
        date_trunc('${period}', ${dateColumn}) + interval '1 ${period}' AS period_end,
        COUNT(*) AS ${countAlias}
      FROM ${table}
      ${condition}
      GROUP BY period_start, period_end
      ORDER BY period_start;
    `;

    const result = await sql.unsafe(query);

    for (const r of result) {
      const start = r.period_start.toISOString().split("T")[0];
      const end = r.period_end.toISOString().split("T")[0];
      r.period = `${start} to ${end}`;
      delete r.period_start;
      delete r.period_end;
    }

    return result;
  } catch (err) {
    console.error("Error in getTrends: ", err.message);
    return { error: err.message };
  }
}

export async function getMarketplaceStats() {
  try {
    const queries = [
      sql`
        SELECT
          COUNT(*)::INT AS total,
          COUNT(*) FILTER (WHERE status = 'Available')::INT AS available,
          COUNT(*) FILTER (WHERE status = 'Sold')::INT AS sold
        FROM marketplace_post;
      `,

      sql`
        SELECT AVG(price)::INT AS avg_price
        FROM marketplace_post
        WHERE status = 'Available';
      `,

      sql`
        SELECT category, AVG(price)::INT AS avg_price, COUNT(*)::INT AS count
        FROM marketplace_post
        GROUP BY category
        ORDER BY avg_price DESC;
      `,

      sql`
        SELECT item_condition, AVG(price)::INT AS avg_price, COUNT(*)::INT AS count
        FROM marketplace_post
        GROUP BY item_condition;
      `,
    ];

    const [summary, avgPrice, byCategory, byCondition] = await Promise.all(queries);

    return {
      summary: summary[0],
      average_price: avgPrice[0]?.avg_price ?? 0,
      items_by_category: byCategory,
      items_by_condition: byCondition,
    };
  } catch (err) {
    console.error("Error in getMarketplaceStats:", err.message);
    return { error: err.message };
  }
}

export async function getTuitionStats() {
  try {
    const queries = [
      sql`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'Available') AS available,
          COUNT(*) FILTER (WHERE status = 'Booked') AS booked
        FROM tuition_post;
      `,

      sql`
        SELECT AVG(remunation)::INT AS avg_remunation
        FROM tuition_post
        WHERE status = 'Available';
      `,

      sql`
        SELECT class, AVG(remunation)::INT AS avg_remunation, COUNT(*)::INT AS count
        FROM tuition_post
        GROUP BY class
        ORDER BY avg_remunation DESC;
      `,

      sql`
        SELECT preferred_gender, AVG(remunation)::INT AS avg_remunation, COUNT(*)::INT AS count
        FROM tuition_post
        GROUP BY preferred_gender;
      `,

      sql`
        SELECT s.name AS subject, AVG(remunation)::INT AS avg_remunation, COUNT(*)::INT AS count
        FROM tuition_post tp
        JOIN tuition_subject ts ON tp.post_id = ts.post_id
        JOIN subject s ON s.subject_id = ts.subject_id
        GROUP BY s.name
        ORDER BY avg_remunation DESC;
      `,
    ];

    const [summary, avgRemunation, byClass, countByGender, countBySubject] = await Promise.all(queries);

    return {
      summary: summary[0],
      average_remunation: avgRemunation[0]?.avg_remunation ?? 0,
      posts_by_class: byClass,
      posts_by_preferred_gender: countByGender,
      posts_by_subject: countBySubject,
    };
  } catch (err) {
    console.error("Error in getTuitionStats:", err.message);
    return { error: err.message };
  }
}
