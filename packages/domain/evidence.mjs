import { createHash } from "node:crypto";
export const sha256 = value => createHash("sha256").update(value).digest("hex");
export function approveSuggestion(suggestion, reviewer) {
  if (!suggestion.sourceFragmentId) throw new Error("Factual suggestions require a source fragment");
  if (!reviewer?.roles?.includes("REVIEWER")) throw new Error("Reviewer permission required");
  return { ...suggestion, status:"APPROVED", approval:{ reviewerId:reviewer.id, at:new Date().toISOString() } };
}
export function diffComponents(before, after) {
  const old = new Map(before.map(x=>[x.purl,x.version]));
  return after.filter(x=>old.get(x.purl)!==x.version).map(x=>({purl:x.purl,from:old.get(x.purl)??null,to:x.version}));
}
export function markStale(claims, changes) {
  const touched=new Set(changes.map(x=>x.purl));
  return claims.map(c=>c.componentPurls.some(p=>touched.has(p))?{...c,status:"STALE"}:c);
}
export function incidentWorksheet(approvedFacts) {
  const required=["product","version","awarenessAt","summary","exploitationObserved"];
  return { fields:Object.fromEntries(required.map(k=>[k,approvedFacts[k]??null])), missingInformation:required.filter(k=>approvedFacts[k]==null), status:"SUGGESTED", submitted:false };
}
export function buildManifest(files) {
  return { schemaVersion:1, status:"DRAFT_NOT_APPROVED", files:Object.entries(files).map(([path,body])=>({path,sha256:sha256(body),bytes:Buffer.byteLength(body)})) };
}
