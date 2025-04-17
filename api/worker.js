

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "GET" && pathname === "/reservations") {
      return handleGetReservations(env);
    }

    return new Response("Not Found", { status: 404 });
  }
}

async function handleGetReservations(env) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT r.id, r.start_time, r.end_time, r.flight_review,
              u.name AS user_name, a.tail_number AS airplane_tail
       FROM reservations r
       JOIN users u ON r.user_id = u.id
       JOIN airplanes a ON r.airplane_id = a.id
       WHERE r.start_time >= datetime('now')
       ORDER BY r.start_time ASC`
    ).all();

    return Response.json(results);
  } catch (error) {
    return new Response("Failed to fetch reservations: " + error.toString(), { status: 500 });
  }
}