export async function onRequestPost(context) {
  const { request, env } = context;
  const payload = await request.json();
  console.log("Inbound payload:", payload);

  let from, message;

  if (Array.isArray(payload)) {
    const firstEvent = payload[0];
    if (firstEvent?.message) {
      from = firstEvent.message.from;
      message = firstEvent.message.text;
    }
  } else {
    from = payload.message?.from || payload.from;
    message = payload.message?.text || payload.text || payload.messageText || undefined;
  }

  console.log("Inbound SMS received:", { from, message });

  const today = new Date();
  const todayISO = today.toISOString().split('T')[0]; // YYYY-MM-DD

  const prompt = `
  You are an AI agent for a flying club. Extract the following information from this text message:
  - Tail Number
  - Start Date (in ISO 8601 format YYYY-MM-DD; use the current year if the message does not specify a year)
  - Start Time (in 24-hour format HH:MM)
  - End Date (in ISO 8601 format YYYY-MM-DD; if not specified, assume same day as start)
  - End Time (in 24-hour format HH:MM; if not specified, use 23:59)

  Today’s date is ${todayISO}. Use this information to infer the correct year if missing.

  Return ONLY strict JSON with these fields: tail_number, start_date, start_time, end_date, end_time. No explanations, no markdown, no extra text.

  Message: "${message}"
  `;

  const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
    prompt
  });

  console.log("AI parsed:", aiResponse);

  const extractedText = aiResponse.response;

  const jsonMatch = extractedText.match(/{[\s\S]*}/);

  let reservationData = null;

  if (jsonMatch && jsonMatch[0]) {
    try {
      reservationData = JSON.parse(jsonMatch[0].trim());
      console.log("Parsed Reservation Data:", reservationData);
    } catch (error) {
      console.error("Failed to parse JSON:", error);
    }
  } else {
    console.error("No JSON block found in AI response.");
  }

  if (reservationData) {
    const currentYear = new Date().getFullYear();

    function correctYearIfNeeded(dateStr) {
      if (!dateStr) return dateStr;
      const [year, month, day] = dateStr.split("-");
      if (Number(year) < currentYear) {
        return `${currentYear}-${month}-${day}`;
      }
      return dateStr;
    }

    reservationData.start_date = correctYearIfNeeded(reservationData.start_date);
    reservationData.end_date = correctYearIfNeeded(reservationData.end_date);

    try {
      const findAirplane = await env.DB.prepare(`
        SELECT id FROM airplanes WHERE tail_number = ?
      `).bind(reservationData.tail_number).first();

      if (!findAirplane) {
        console.error(`Airplane not found for tail number: ${reservationData.tail_number}`);
        return new Response(`Airplane not found`, { status: 400 });
      }

      const airplaneId = findAirplane.id;

      const startDateTime = new Date(`${reservationData.start_date}T${reservationData.start_time}`).toISOString();
      const endDateTime = new Date(`${reservationData.end_date}T${reservationData.end_time}`).toISOString();

      await env.DB.prepare(`
        INSERT INTO reservations (airplane_id, user_id, start_time, end_time, notes)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        airplaneId,
        "auth0|user2",
        startDateTime,
        endDateTime,
        `Created via SMS from ${from}`
      )
      .run();

      console.log("Reservation created successfully!");
    } catch (error) {
      console.error("Failed to insert reservation:", error);
    }
  }

  return new Response("Received", { status: 200 });
}
