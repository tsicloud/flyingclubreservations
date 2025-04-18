import { getD1Database } from '../_utils/database';

export async function onRequest(context) {
  const db = getD1Database(context);

  const { results } = await db.prepare(`
    SELECT id, tail_number, name, color
    FROM airplanes
    ORDER BY tail_number
  `).all();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
}
