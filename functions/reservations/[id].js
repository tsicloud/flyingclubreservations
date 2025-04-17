export async function onRequestDelete(context) {
    const { env, params } = context;
  
    if (!env.DB) {
      return new Response("D1 database not configured", { status: 500 });
    }
  
    try {
      const id = params.id;
  
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