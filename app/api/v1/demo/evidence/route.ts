import {
  callDemoModel,
  DEMO_SOURCE_FRAGMENT_ID,
  demoResponse,
  parseDemoRequest,
  sourceFragments,
} from "../_shared";

export async function POST(request: Request) {
  const parsed = await parseDemoRequest(request, "evidence");
  if (!parsed.ok) return parsed.response;
  const fragment = sourceFragments[DEMO_SOURCE_FRAGMENT_ID];
  const model = await callDemoModel(request, "evidence", {
    task: "Extract one grounded security claim, preserving exact qualifiers.",
    sourceFragment: {
      id: DEMO_SOURCE_FRAGMENT_ID,
      text: fragment.text,
    },
  });
  if (!model.ok) return model.response;
  if (model.result.output.sourceFragmentId !== DEMO_SOURCE_FRAGMENT_ID) {
    return demoResponse({ error: "Model cited an unknown source fragment." }, 500);
  }
  return demoResponse({
    ...model.result,
    suggestionId: `demo:${model.result.responseId}`,
    demo: {
      caseId: parsed.data.caseId,
      sourcePath: "/demo-source/aegisedge-architecture-v2.3.pdf#page=4",
      persistence: "NON_PERSISTENT",
    },
  });
}
