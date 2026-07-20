import { aiInputSchemas, validateInput } from "../_inputs";
import { callModel, consumeRateLimit, impactCases, requireIdentity, safeError } from "../_shared";

type ImpactInput = { impactCaseId: string };

export async function POST(request: Request) {
  const identity = requireIdentity(request);
  if (!identity) return Response.json({ error: "Authentication required." }, { status: 401 });

  const parsed = validateInput<ImpactInput>(
    aiInputSchemas.impact,
    await request.json().catch(() => null),
  );
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const impact = impactCases[parsed.data.impactCaseId as keyof typeof impactCases];
  if (!impact) return Response.json({ error: "Unknown impact case." }, { status: 400 });

  try {
    if (!(await consumeRateLimit(identity, "impact"))) {
      return Response.json({ error: "Rate limit reached. Try again later." }, { status: 429 });
    }
    const result = await callModel("impact", {
      task: "Explain review priority for the deterministic result. Do not add or remove stale nodes.",
      deterministicImpact: impact,
    });
    const allowed = new Set<string>([...impact.staleNodeIds, ...impact.currentNodeIds]);
    if (result.output.citedNodeIds.some((id: string) => !allowed.has(id))) {
      return Response.json({ error: "Model cited an unknown graph node." }, { status: 500 });
    }
    return Response.json({ ...result, deterministicImpact: impact });
  } catch (error) {
    return safeError(error);
  }
}
