export const runtime = "nodejs";

/** Logging stub: accepts notifications without verifying or updating payments yet. */
export async function POST(request: Request) {
  const body = await request.text();
  let payload: unknown = body;
  try {
    payload = JSON.parse(body);
  } catch {
    // Preserve non-JSON payloads in the log while this endpoint is a stub.
  }
  console.info("[payments:tbank] webhook", JSON.stringify(payload));
  return new Response("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
