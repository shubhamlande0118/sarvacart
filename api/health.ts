import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  _request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "private, no-store");
  return response.status(200).json({
    ok: true,
    service: "sarvacart-api",
    timestamp: new Date().toISOString(),
  });
}
