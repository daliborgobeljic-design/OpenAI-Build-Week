import { env } from "cloudflare:workers";
import { randomUUID } from "node:crypto";
import { runStructured } from "@/packages/ai/responses.mjs";

export type Identity={actorId:string;tenantId:"aegis-labs"};
export const sourceFragments={
 "architecture-v2.3:p4:p2":{artifactLabel:"aegisedge-architecture-v2.3.pdf",text:"All administrative traffic is protected using mutual TLS 1.3. Device identities are provisioned during manufacturing and rotated every 90 days. Failed authentication attempts are rate limited and recorded."}
} as const;
export const impactCases={
 "sbom-2.3-2.4":{changedComponent:{id:"pkg:openssl",from:"3.0.12",to:"3.0.14"},staleNodeIds:["claim-secure-admin","claim-crypto-update"],currentNodeIds:["claim-access-logging"]}
} as const;
export const incidentCases={
 "incident-aegis-001":{approvedFacts:[{id:"fact-product",value:"AegisEdge Gateway 2.3",status:"APPROVED"},{id:"fact-awareness",value:"2026-07-19 08:15 UTC",status:"APPROVED"},{id:"fact-summary",value:"Authentication bypass under investigation",status:"APPROVED"},{id:"fact-exploitation",value:null,status:"APPROVED"}]}
} as const;

export function requireIdentity(request:Request):Identity|null{
 const email=request.headers.get("oai-authenticated-user-email");if(email)return{actorId:email,tenantId:"aegis-labs"};
 const url=new URL(request.url);if((url.hostname==="localhost"||url.hostname==="127.0.0.1")&&request.headers.get("x-cra-demo-user")==="aegis-labs-judge")return{actorId:"demo-reviewer",tenantId:"aegis-labs"};
 return null;
}

export async function consumeRateLimit(identity:Identity,useCase:string){
 const windowStart=new Date(Math.floor(Date.now()/600000)*600000).toISOString();
 await env.DB.prepare("CREATE TABLE IF NOT EXISTS ai_rate_limits (tenant_id text NOT NULL, actor_id text NOT NULL, use_case text NOT NULL, window_start text NOT NULL, calls integer NOT NULL DEFAULT 0, PRIMARY KEY (tenant_id, actor_id, use_case, window_start))").run();
 const row=await env.DB.prepare("SELECT calls FROM ai_rate_limits WHERE tenant_id=? AND actor_id=? AND use_case=? AND window_start=?").bind(identity.tenantId,identity.actorId,useCase,windowStart).first<{calls:number}>();
 if((row?.calls||0)>=6)return false;
 await env.DB.prepare("INSERT INTO ai_rate_limits (tenant_id,actor_id,use_case,window_start,calls) VALUES (?,?,?,?,1) ON CONFLICT(tenant_id,actor_id,use_case,window_start) DO UPDATE SET calls=calls+1").bind(identity.tenantId,identity.actorId,useCase,windowStart).run();return true;
}

export async function callModel(useCase:"evidence"|"impact"|"incident",input:unknown){
 if(!process.env.OPENAI_API_KEY)throw new Error("AI_NOT_CONFIGURED");
 return runStructured({useCase,input,apiKey:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||"gpt-5.6-sol",reasoningEffort:"medium"});
}

export async function persistSuggestion(identity:Identity,sourceFragmentId:string,proposedValue:string,responseId:string){
 const id=randomUUID(),createdAt=new Date().toISOString();
 await env.DB.prepare("INSERT INTO suggestions (id,tenant_id,product_id,source_fragment_id,proposed_value,status,model_run_id,created_at) VALUES (?,?,?,?,?,'SUGGESTED',?,?)").bind(id,identity.tenantId,"aegisedge-2.3",sourceFragmentId,proposedValue,responseId,createdAt).run();
 return id;
}

export function safeError(error:unknown){
 if(error instanceof Error&&error.message==="AI_NOT_CONFIGURED")return Response.json({error:"Live GPT-5.6 is not configured server-side."},{status:500});
 return Response.json({error:"The GPT-5.6 request could not be completed."},{status:500});
}
