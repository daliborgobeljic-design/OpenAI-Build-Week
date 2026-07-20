import { env } from "cloudflare:workers";
import { randomUUID } from "node:crypto";
import { aiInputSchemas, validateInput } from "../_inputs";
import { requireIdentity, safeError } from "../_shared";

type ApproveInput = { suggestionId: string };

export async function POST(request: Request) {
  const identity = requireIdentity(request);
  if (!identity) return Response.json({ error: "Authentication required." }, { status: 401 });

  const parsed = validateInput<ApproveInput>(
    aiInputSchemas.approve,
    await request.json().catch(() => null),
  );
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const suggestion = await env.DB.prepare(
      "SELECT id,status FROM suggestions WHERE id=? AND tenant_id=?",
    ).bind(parsed.data.suggestionId, identity.tenantId).first<{ id: string; status: string }>();
    if (!suggestion) return Response.json({ error: "Suggestion not found." }, { status: 400 });
    if (suggestion.status !== "SUGGESTED") {
      return Response.json({ error: "Suggestion is not awaiting review." }, { status: 400 });
    }

    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare("UPDATE suggestions SET status='APPROVED' WHERE id=? AND tenant_id=?")
        .bind(parsed.data.suggestionId, identity.tenantId),
      env.DB.prepare(
        "INSERT INTO approvals (id,tenant_id,suggestion_id,reviewer_id,created_at) VALUES (?,?,?,?,?)",
      ).bind(randomUUID(), identity.tenantId, parsed.data.suggestionId, identity.actorId, now),
    ]);
    return Response.json({ suggestionId: parsed.data.suggestionId, status: "APPROVED", approvedAt: now });
  } catch (error) {
    return safeError(error);
  }
}
