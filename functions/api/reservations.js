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
        const {
            id,
            airplane_id,
            user_id,
            start_time,
            end_time,
            flight_review = false,
            notes = "",
            mode
        } = data;

        if (mode === "delete") {
            if (!id) {
                return new Response("Reservation ID is required for delete", { status: 400 });
            }
            const stmt = env.DB.prepare(`DELETE FROM reservations WHERE id = ?`).bind(id);
            await stmt.run();
            return new Response("Reservation deleted", { status: 200 });
        }

        if (!airplane_id || !user_id || !start_time || !end_time) {
            return new Response("Missing required fields", { status: 400 });
        }

        let result;
        if (id) {
            // Update
            const stmt = env.DB.prepare(
                `UPDATE reservations
                 SET airplane_id = ?, user_id = ?, start_time = ?, end_time = ?, flight_review = ?, notes = ?
                 WHERE id = ?`
            ).bind(airplane_id, user_id, start_time, end_time, flight_review, notes, id);
            result = await stmt.run();
        } else {
            // Insert
            const stmt = env.DB.prepare(
                `INSERT INTO reservations (airplane_id, user_id, start_time, end_time, flight_review, notes)
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(airplane_id, user_id, start_time, end_time, flight_review, notes);
            result = await stmt.run();
        }

        return Response.json({ success: true, id: result.lastRowId || id });
    } catch (error) {
        console.error("Error saving reservation:", error);
        return new Response("Failed to save reservation", { status: 500 });
    }
}