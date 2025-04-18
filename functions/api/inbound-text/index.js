export async function onRequestPost(context) {
  const { request } = context;
  const payload = await request.json();

  const from = payload.from;  // Sender's phone number
  const message = payload.text;  // The SMS message content

  console.log("Inbound SMS received:", { from, message });

  // Placeholder for AI parsing and reservation creation
  return new Response("Received", { status: 200 });
}
