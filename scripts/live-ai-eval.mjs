import { readFile, writeFile, mkdir } from "node:fs/promises";
import { runStructured } from "../packages/ai/responses.mjs";
if(!process.env.OPENAI_API_KEY){console.error("LIVE_EVAL_SKIPPED: set OPENAI_API_KEY locally; no fixture will be presented as a live result");process.exit(2)}
const source=await readFile(new URL("../fixtures/aegisedge-architecture.md",import.meta.url),"utf8");
const result=await runStructured({useCase:"evidence",input:{fragments:[{id:"architecture-p4-p2",locator:"page 4 paragraph 2",text:source}]}});
if(result.output.sourceFragmentId!=="architecture-p4-p2")throw new Error("Live model cited an unknown fragment");
await mkdir(new URL("../work/live-evals/",import.meta.url),{recursive:true});
await writeFile(new URL("../work/live-evals/evidence.json",import.meta.url),JSON.stringify({responseId:result.responseId,model:result.model,status:result.status,schemaValid:true,citationValid:true},null,2));
console.log(`LIVE_EVAL_PASS ${result.model} ${result.responseId}`);
