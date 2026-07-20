import { aiInputSchemas, validateInput } from "../_inputs";
import { callModel, consumeRateLimit, incidentCases, requireIdentity, safeError } from "../_shared";

type IncidentInput = { incidentId: string };

export async function POST(request: Request) {
  const identity = requireIdentity(request);
  if (!identity) return Response.json({ error: "Authentication required." }, { status: 401 });

  const parsed = validateInput<IncidentInput>(
    aiInputSchemas.incident,
    await request.json().catch(() => null),
  );
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const incident = incidentCases[parsed.data.incidentId as keyof typeof incidentCases];
  if (!incident) return Response.json({ error: "Unknown incident." }, { status: 400 });

  try {
    if (!(await consumeRateLimit(identity, "incident"))) {
      return Response.json({ error: "Rate limit reached. Try again later." }, { status: 429 });
    }
    const result = await callModel("incident", {
      task: "Draft 24h and 72h worksheet fields only from approved facts. Preserve unknowns and list missing information. Never submit.",
      facts: incident.approvedFacts,
    });
    const allowed = new Set<string>(incident.approvedFacts.map((fact) => fact.id));
    if (result.output.citations.some((id: string) => !allowed.has(id))) {
      return Response.json({ error: "Model cited an unapproved fact." }, { status: 500 });
    }
    return Response.json(result);
  } catch (error) {
    return safeError(error);
  }
}
