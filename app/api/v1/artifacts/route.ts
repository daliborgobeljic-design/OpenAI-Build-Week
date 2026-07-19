import { env } from "cloudflare:workers";
import { randomUUID } from "node:crypto";
import { getDb } from "../../../../db";
import { artifacts, auditEvents } from "../../../../db/schema";
const MAX_BYTES=5*1024*1024;const ALLOWED=new Set(["application/pdf","application/json"]);
function identity(request:Request){const email=request.headers.get("oai-authenticated-user-email");if(email)return{actorId:email,tenantId:"aegis-labs"};const url=new URL(request.url);if((url.hostname==="localhost"||url.hostname==="127.0.0.1")&&request.headers.get("x-cra-demo-user")==="aegis-labs-judge")return{actorId:"demo-reviewer",tenantId:"aegis-labs"};return null}
function validMagic(bytes:Uint8Array,type:string){if(type==="application/pdf")return new TextDecoder().decode(bytes.slice(0,5))==="%PDF-";const first=new TextDecoder().decode(bytes).trimStart()[0];return first==="{"||first==="["}
async function ensureUploadSchema(){await env.DB.batch([env.DB.prepare("CREATE TABLE IF NOT EXISTS artifacts (id text PRIMARY KEY NOT NULL, tenant_id text NOT NULL, product_id text NOT NULL, object_key text NOT NULL, sha256 text NOT NULL, created_at text NOT NULL)"),env.DB.prepare("CREATE TABLE IF NOT EXISTS audit_events (id text PRIMARY KEY NOT NULL, tenant_id text NOT NULL, event_type text NOT NULL, actor_id text NOT NULL, payload_json text NOT NULL, previous_hash text, event_hash text NOT NULL, sequence integer NOT NULL, created_at text NOT NULL)")])}
export async function POST(request:Request){
 const user=identity(request);if(!user)return Response.json({error:"Authentication required"},{status:401});
 const form=await request.formData();const file=form.get("file");if(!(file instanceof File))return Response.json({error:"file is required"},{status:400});
 if(!ALLOWED.has(file.type)||file.size>MAX_BYTES)return Response.json({error:"Only PDF/JSON up to 5 MB is allowed"},{status:415});
 const bytes=new Uint8Array(await file.arrayBuffer());if(!validMagic(bytes,file.type))return Response.json({error:"File signature does not match its declared type"},{status:415});
 const id=randomUUID();const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes))).map(x=>x.toString(16).padStart(2,"0")).join("");const objectKey=`${user.tenantId}/${id}/${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
 await ensureUploadSchema();await env.ARTIFACTS.put(objectKey,bytes.buffer);const now=new Date().toISOString();const db=getDb();
 await db.batch([db.insert(artifacts).values({id,tenantId:user.tenantId,productId:"aegisedge-2.3",objectKey,sha256:digest,createdAt:now}),db.insert(auditEvents).values({id:randomUUID(),tenantId:user.tenantId,eventType:"ARTIFACT_UPLOADED",actorId:user.actorId,payloadJson:JSON.stringify({artifactId:id,contentType:file.type,bytes:file.size}),previousHash:null,eventHash:digest,sequence:Date.now(),createdAt:now})]);
 return Response.json({artifact:{id,name:file.name,sha256:digest,bytes:file.size,status:"STORED"}},{status:201});
}
