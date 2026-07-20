import { mkdir, readFile, writeFile } from "node:fs/promises";
import { runStructured, validateStructured } from "../packages/ai/responses.mjs";

if (!process.env.OPENAI_API_KEY) {
  console.error("LIVE_EVAL_SKIPPED: OPENAI_API_KEY is not present in this server-side process.");
  process.exit(2);
}

const sourceFragmentId = "architecture-v2.3:p4:p2";
const source = await readFile(
  new URL("../fixtures/aegisedge-architecture.md", import.meta.url),
  "utf8",
);
const result = await runStructured({
  useCase: "evidence",
  model: "gpt-5.6-sol",
  reasoningEffort: "medium",
  input: {
    task: "Extract one grounded security claim, preserving exact qualifiers.",
    sourceFragment: { id: sourceFragmentId, text: source },
  },
});

if (!/^resp_/.test(result.responseId)) throw new Error("Live response.id was not returned.");
if (result.model !== "gpt-5.6-sol") throw new Error(`Unexpected live model: ${result.model}`);
if (!validateStructured("evidence", result.output)) throw new Error("Live output failed JSON Schema validation.");
if (result.output.sourceFragmentId !== sourceFragmentId) throw new Error("Live model cited an unknown fragment.");
const safeResult = JSON.stringify(result).toLowerCase();
if (safeResult.includes("openai_api_key") || safeResult.includes("authorization") || safeResult.includes("bearer ")) {
  throw new Error("Sensitive metadata appeared in the live result.");
}

const report = {
  responseId: result.responseId,
  model: result.model,
  status: result.status,
  schemaValid: true,
  citationValid: true,
  sensitiveMetadataAbsent: true,
};
await mkdir(new URL("../work/live-evals/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../work/live-evals/evidence.json", import.meta.url),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(`LIVE_EVAL_PASS ${result.model} ${result.responseId}`);
