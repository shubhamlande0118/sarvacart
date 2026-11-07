import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const present = raw !== undefined && raw !== "";
  let looksLikeJson = false;
  let parses = false;

  if (present) {
    looksLikeJson = raw.trimStart().startsWith("{");
    try {
      JSON.parse(raw);
      parses = true;
    } catch {
      parses = false;
    }
  }

  res.status(200).json({
    firebaseServiceAccountPresent: present,
    firebaseServiceAccountLength: present ? raw.length : 0,
    firebaseServiceAccountLooksLikeJson: looksLikeJson,
    firebaseServiceAccountParses: parses,
  });
}
