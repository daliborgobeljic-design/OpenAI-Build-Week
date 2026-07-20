import {
  callDemoModel,
  demoResponse,
  incidentCases,
  parseDemoRequest,
} from "../_shared";

export async function POST(request: Request) {
  const parsed = await parseDemoRequest(request, "incident");
  if (!parsed.ok) return parsed.response;
  const incident = incidentCases["incident-aegis-001"];
  const model = await callDemoModel(request, "incident", {
    task: "Draft 24h and 72h worksheet fields only from approved facts. Preserve unknowns and list missing information. Never submit.",
    facts: incident.approvedFacts,
  });
  if (!model.ok) return model.response;
  const allowed = new Set<string>(incident.approvedFacts.map((fact) => fact.id));
  if (model.result.output.citations.some((id: string) => !allowed.has(id))) {
    return demoResponse({ error: "Model cited an unapproved fact." }, 500);
  }
  return demoResponse({
    ...model.result,
    demo: {
      caseId: parsed.data.caseId,
      persistence: "NON_PERSISTENT",
      submitted: false,
    },
  });
}
