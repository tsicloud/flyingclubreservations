import { DateTime } from "luxon";
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
You are an AI agent for a flying club.

Extract the following fields from this SMS message:
- Tail Number
- Start Date (YYYY-MM-DD, ISO 8601 format)
- Start Time (24-hour format, HH:MM)
- End Date (YYYY-MM-DD, ISO 8601 format)
- End Time (24-hour format, HH:MM)

TODAY'S DATE: ${todayISO}

**Date Parsing Rules:**
- If a full date is mentioned (e.g., "May 2", "4/27", "July 4th", "Sunday 4/27", "Sunday the 27th"), use that date directly.
- If only a weekday is mentioned (e.g., "Sunday", "next Tuesday"), find the next occurrence of that weekday based on TODAY'S DATE.
  - Example: If today is Friday and the message says "Sunday", pick the Sunday 2 days later (not 9 days later).
- Assume the current year unless a different year is mentioned.
- If end date is missing, assume same as start date.
- If end time is missing, assume 23:59.

**Strict Instructions:**
- Respond with ONLY a valid JSON object matching these fields: tail_number, start_date, start_time, end_date, end_time.
- Do NOT add explanations, markdown, or any commentary.

MESSAGE: "${message}"
`;

  const aiResponse = await env.AI.run("@cf/mistralai/mistral-small-3.1-24b-instruct", {
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

      const startDateTime = DateTime.fromISO(`${reservationData.start_date}T${reservationData.start_time}`, { zone: 'America/Denver' }).toUTC().toISO();
      const endDateTime = DateTime.fromISO(`${reservationData.end_date}T${reservationData.end_time}`, { zone: 'America/Denver' }).toUTC().toISO();

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
