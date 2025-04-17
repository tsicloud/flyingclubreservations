export async function onRequestGet(context) {
    const { env } = context;
    console.log("env.DB", env.DB);

    if (!env.DB) {
      return new Response("D1 database not configured", { status: 500 });
    }

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
}

export async function onRequestPost(context) {
    const { request, env } = context;

    if (!env.DB) {
      return new Response("D1 database not configured", { status: 500 });
    }

    try {
      const data = await request.json();

      const { airplane_id, user_id, start_time, end_time, flight_review } = data;

      const stmt = env.DB.prepare(
        `INSERT INTO reservations (airplane_id, user_id, start_time, end_time, flight_review)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(airplane_id, user_id, start_time, end_time, flight_review || false);

      const result = await stmt.run();

      return Response.json({ success: true, id: result.lastRowId });
    } catch (error) {
      console.error("Error creating reservation:", error);
      return new Response("Failed to create reservation", { status: 500 });
    }
}

export async function onRequestDelete(context) {
  const { env } = context;

  if (!env.DB) {
    return new Response("D1 database not configured", { status: 500 });
  }

  try {
    const urlParts = new URL(context.request.url).pathname.split("/");
    const id = urlParts[urlParts.length - 1];
    console.log("Parsed ID for deletion:", id);
    if (!id) {
      return new Response("Reservation ID is required", { status: 400 });
    }

    const stmt = env.DB.prepare(
      `DELETE FROM reservations WHERE id = ?`
    ).bind(id);

    await stmt.run();

    return new Response("Reservation deleted", { status: 200 });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return new Response("Failed to delete reservation", { status: 500 });
  }
}