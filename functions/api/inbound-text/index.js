
export async function onRequestPost(context) {
  const { request, env } = context;
  const payload = await request.json();

  const from = payload.from;  // Sender's phone number
  const message = payload.text;  // The SMS message content

  console.log("Inbound SMS received:", { from, message });

  // Run the AI model directly via env.AI

  // Define a prompt to instruct the model
  const prompt = `
You are an AI agent for a flying club. Extract the following information from this text message:
- Tail Number
- Start Date
- Start Time
- End Date (if mentioned; otherwise assume same day)
- End Time

Return the result as JSON with fields: tail_number, start_date, start_time, end_date, end_time.

Message: "${message}"
`;

  // Run the AI model
  const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
    prompt
  });

  console.log("AI parsed:", aiResponse);

  return new Response("Received", { status: 200 });
}
