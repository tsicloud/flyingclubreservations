export async function onRequestGet(context) {
    const { env } = context;
    if (!env.DB) {
        return new Response("D1 database not configured", { status: 500 });
    }

    const { results } = await env.DB.prepare(
        `SELECT r.id, r.start_time, r.end_time, r.flight_review, r.notes,
                u.name AS user_name, 
                a.tail_number AS airplane_tail,
                a.color AS airplane_color
         FROM reservations r
         JOIN users u ON r.user_id = u.id
         JOIN airplanes a ON r.airplane_id = a.id
         ORDER BY r.start_time ASC`
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;

    if (!env.DB) {
        return new Response("D1 database not configured", { status: 500 });
    }

    try {
        const data = await request.json();
        const {
            airplane_id,
            user_id,
            start_time,
            end_time,
            flight_review = false,
            notes = ""
        } = data;

        if (!airplane_id || !user_id || !start_time || !end_time) {
            return new Response("Missing required fields", { status: 400 });
        }

        const stmt = env.DB.prepare(
            `INSERT INTO reservations (airplane_id, user_id, start_time, end_time, flight_review, notes)
             VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(airplane_id, user_id, start_time, end_time, flight_review, notes);
        const result = await stmt.run();
        return new Response(JSON.stringify({ success: true, id: result.lastRowId }), {
          headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Error saving reservation:", error);
        return new Response("Failed to save reservation", { status: 500 });
    }
}