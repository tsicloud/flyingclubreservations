export async function onRequest(context) {
  const { request, env, params } = context;

  if (!env.DB) {
    return new Response("D1 database not configured", { status: 500 });
  }

  const id = params.id;

  if (!id) {
    return new Response("Reservation ID is required", { status: 400 });
  }

  try {
    if (request.method === "DELETE") {
      const stmt = env.DB.prepare(`DELETE FROM reservations WHERE id = ?`).bind(id);
      await stmt.run();
      return new Response("Reservation deleted", { status: 200 });
    } else if (request.method === "PUT") {
      const data = await request.json();
      const { start_time, end_time, airplane_id, notes } = data;

      if (!start_time || !end_time || !airplane_id) {
        return new Response("Missing required fields", { status: 400 });
      }

      const stmt = env.DB.prepare(`
        UPDATE reservations
        SET start_time = ?, end_time = ?, airplane_id = ?, notes = ?
        WHERE id = ?
      `).bind(start_time, end_time, airplane_id, notes || '', id);

      await stmt.run();
      return new Response("Reservation updated", { status: 200 });
    } else {
      return new Response("Method not allowed", { status: 405 });
    }
  } catch (error) {
    console.error("Error handling reservation:", error);
    return new Response("Failed to handle reservation", { status: 500 });
  }
}