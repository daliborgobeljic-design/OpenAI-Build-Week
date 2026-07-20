import {
  callDemoModel,
  demoResponse,
  impactCases,
  parseDemoRequest,
} from "../_shared";

export async function POST(request: Request) {
  const parsed = await parseDemoRequest(request, "impact");
  if (!parsed.ok) return parsed.response;
  const impact = impactCases["sbom-2.3-2.4"];
  const model = await callDemoModel(request, "impact", {
    task: "Explain review priority for the deterministic result. Do not add or remove stale nodes.",
    deterministicImpact: impact,
  });
  if (!model.ok) return model.response;
  const allowed = new Set<string>([...impact.staleNodeIds, ...impact.currentNodeIds]);
  if (model.result.output.citedNodeIds.some((id: string) => !allowed.has(id))) {
    return demoResponse({ error: "Model cited an unknown graph node." }, 500);
  }
  return demoResponse({
    ...model.result,
    deterministicImpact: impact,
    demo: {
      caseId: parsed.data.caseId,
      persistence: "NON_PERSISTENT",
    },
  });
}
