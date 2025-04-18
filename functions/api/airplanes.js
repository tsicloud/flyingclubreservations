export async function onRequest(context) {
  const db = context.env.DB;

  const { results } = await db.prepare(`
    SELECT id, tail_number, name, color
    FROM airplanes
    ORDER BY tail_number
  `).all();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
}
