export async function onRequestGet(context) {
    const { env } = context;
    console.log("env.DB", env.DB);

    if (!env.DB) {
      return new Response("D1 database not configured", { status: 500 });
    }

    const { results } = await env.DB.prepare(
      `SELECT r.id, r.start_time, r.end_time,
              u.name AS user_name, a.tail_number AS airplane_tail
       FROM reservations r
       JOIN users u ON r.user_id = u.id
       JOIN airplanes a ON r.airplane_id = a.id
       WHERE r.start_time >= datetime('now')
       ORDER BY r.start_time ASC`
    ).all();

    return Response.json(results);
  }