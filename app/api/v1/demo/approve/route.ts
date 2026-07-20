import { demoResponse, parseDemoRequest } from "../_shared";

export async function POST(request: Request) {
  const parsed = await parseDemoRequest(request, "approve");
  if (!parsed.ok) return parsed.response;
  return demoResponse({
    suggestionId: `demo:${parsed.data.responseId}`,
    status: "APPROVED",
    approvedAt: new Date().toISOString(),
    demo: {
      caseId: parsed.data.caseId,
      persistence: "NON_PERSISTENT",
      reviewer: "PUBLIC_JUDGE_SESSION",
    },
  });
}
