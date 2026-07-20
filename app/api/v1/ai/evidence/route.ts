import { env } from "cloudflare:workers";
import { aiInputSchemas, validateInput } from "../_inputs";
import {
  callModel,
  consumeRateLimit,
  persistSuggestion,
  requireIdentity,
  safeError,
  sourceFragments,
} from "../_shared";

type EvidenceInput = { artifactId: string; sourceFragmentId: string };

export async function POST(request: Request) {
  const identity = requireIdentity(request);
  if (!identity) return Response.json({ error: "Authentication required." }, { status: 401 });

  const parsed = validateInput<EvidenceInput>(
    aiInputSchemas.evidence,
    await request.json().catch(() => null),
  );
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const fragment = sourceFragments[parsed.data.sourceFragmentId as keyof typeof sourceFragments];
  if (!fragment) return Response.json({ error: "Unknown source fragment." }, { status: 400 });

  try {
    const artifact = await env.DB.prepare(
      "SELECT id FROM artifacts WHERE id=? AND tenant_id=?",
    ).bind(parsed.data.artifactId, identity.tenantId).first<{ id: string }>();
    if (!artifact) {
      return Response.json({ error: "Artifact was not found for this tenant." }, { status: 400 });
    }
    if (!(await consumeRateLimit(identity, "evidence"))) {
      return Response.json({ error: "Rate limit reached. Try again later." }, { status: 429 });
    }

    const result = await callModel("evidence", {
      task: "Extract one grounded security claim, preserving exact qualifiers.",
      sourceFragment: { id: parsed.data.sourceFragmentId, text: fragment.text },
    });
    if (result.output.sourceFragmentId !== parsed.data.sourceFragmentId) {
      return Response.json({ error: "Model cited an unknown source fragment." }, { status: 500 });
    }
    const suggestionId = await persistSuggestion(
      identity,
      parsed.data.sourceFragmentId,
      result.output.proposedValue,
      result.responseId,
    );
    return Response.json({ ...result, suggestionId });
  } catch (error) {
    return safeError(error);
  }
}
