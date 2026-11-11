import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const present = raw !== undefined && raw !== "";
  let looksLikeJson = false;
  let parses = false;
  let backendProjectId: string | undefined;
  let match: boolean | undefined;

  if (present) {
    looksLikeJson = raw.trimStart().startsWith("{");
    try {
      const parsed = JSON.parse(raw);
      parses = true;
      backendProjectId = parsed.project_id as string | undefined;
      const frontendProjectId = String(_req.query.frontendProjectId || "");
      if (frontendProjectId) {
        match = frontendProjectId === backendProjectId;
      }
    } catch {
      parses = false;
    }
  }

  res.status(200).json({
    firebaseServiceAccountPresent: present,
    firebaseServiceAccountLength: present ? raw.length : 0,
    firebaseServiceAccountLooksLikeJson: looksLikeJson,
    firebaseServiceAccountParses: parses,
    backendProjectId,
    frontendProjectId: _req.query.frontendProjectId || undefined,
    projectIdsMatch: match,
  });
}
