"use client";

import { useState, useSyncExternalStore } from "react";

const subscribeHydration = () => () => {};
const clientIsReady = () => true;
const serverIsPending = () => false;

const steps = ["Evidence review", "Evidence graph", "SBOM impact", "Incident draft", "Dossier"];
const DEMO_CASE = "aegisedge-architecture-v2.3";
const DEMO_SOURCE = "/demo-source/aegisedge-architecture-v2.3.pdf";

type RunState = "idle" | "loading" | "success" | "error";
type Suggestion = { targetField: string; proposedValue: string; sourceFragmentId: string; confidence: number; warnings: string[] };
type ModelMeta = { model: string; responseId: string; status: string };
type Impact = { explanation: string; reviewPriorities: string[]; citedNodeIds: string[] };
type Incident = { fields: Record<string, string | null>; missingInformation: string[]; citations: string[] };

async function responseJson(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The request could not be completed.");
  return data;
}

async function sha256Prefix(blob: Blob) {
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest).slice(0, 6))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export function EvidenceDemo() {
  const hydrated = useSyncExternalStore(subscribeHydration, clientIsReady, serverIsPending);
  const [step, setStep] = useState(0);
  const [approved, setApproved] = useState(false);
  const [caseReady, setCaseReady] = useState(false);
  const [sourceStatus, setSourceStatus] = useState("Load the repository-owned synthetic architecture PDF");
  const [suggestion, setSuggestion] = useState<Suggestion>();
  const [extractState, setExtractState] = useState<RunState>("idle");
  const [extractMessage, setExtractMessage] = useState("No model output yet.");
  const [meta, setMeta] = useState<ModelMeta>();
  const [impact, setImpact] = useState<Impact>();
  const [impactState, setImpactState] = useState<RunState>("idle");
  const [impactMessage, setImpactMessage] = useState("Run GPT-5.6 after the deterministic graph calculation.");
  const [incident, setIncident] = useState<Incident>();
  const [incidentState, setIncidentState] = useState<RunState>("idle");
  const [incidentMessage, setIncidentMessage] = useState("Generate a worksheet from approved facts only.");

  async function loadSynthetic() {
    setSourceStatus("Loading and verifying the synthetic source...");
    setSuggestion(undefined);
    setMeta(undefined);
    setApproved(false);
    setExtractState("idle");
    setExtractMessage("No model output yet.");
    try {
      const response = await fetch(DEMO_SOURCE, { cache: "no-store" });
      if (!response.ok) throw new Error("Synthetic source could not be loaded.");
      const blob = await response.blob();
      const signature = new TextDecoder().decode(await blob.slice(0, 5).arrayBuffer());
      if (signature !== "%PDF-") throw new Error("Synthetic source signature is invalid.");
      setSourceStatus(`Loaded guided synthetic case | SHA-256 ${await sha256Prefix(blob)}...`);
      setCaseReady(true);
    } catch (error) {
      setCaseReady(false);
      setSourceStatus(error instanceof Error ? error.message : "Synthetic source load failed.");
    }
  }

  async function extract() {
    if (!caseReady) return;
    setExtractState("loading");
    setExtractMessage("GPT-5.6 is grounding a structured suggestion...");
    setSuggestion(undefined);
    setApproved(false);
    try {
      const data = await responseJson(await fetch("/api/v1/demo/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: DEMO_CASE }),
      }));
      setSuggestion(data.output);
      setMeta({ model: data.model, responseId: data.responseId, status: data.status });
      setExtractState("success");
      setExtractMessage("Schema-valid live response received. Human review is still required.");
    } catch (error) {
      setExtractState("error");
      setExtractMessage(error instanceof Error ? error.message : "Live extraction failed.");
    }
  }

  async function approve() {
    if (!meta?.responseId) return;
    try {
      const data = await responseJson(await fetch("/api/v1/demo/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: DEMO_CASE, responseId: meta.responseId }),
      }));
      setApproved(data.status === "APPROVED");
    } catch (error) {
      setExtractState("error");
      setExtractMessage(error instanceof Error ? error.message : "Approval failed.");
    }
  }

  async function explainImpact() {
    setImpactState("loading");
    setImpactMessage("GPT-5.6 is explaining the code-computed blast radius...");
    try {
      const data = await responseJson(await fetch("/api/v1/demo/impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: "sbom-2.3-2.4" }),
      }));
      setImpact(data.output);
      setImpactState("success");
      setImpactMessage(`${data.model} | ${data.responseId}`);
    } catch (error) {
      setImpactState("error");
      setImpactMessage(error instanceof Error ? error.message : "Impact explanation failed.");
    }
  }

  async function draftIncident() {
    setIncidentState("loading");
    setIncidentMessage("GPT-5.6 is drafting from approved facts...");
    try {
      const data = await responseJson(await fetch("/api/v1/demo/incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: "incident-aegis-001" }),
      }));
      setIncident(data.output);
      setIncidentState("success");
      setIncidentMessage(`${data.model} | ${data.responseId} | SUGGESTED, not submitted`);
    } catch (error) {
      setIncidentState("error");
      setIncidentMessage(error instanceof Error ? error.message : "Incident draft failed.");
    }
  }

  return (
    <main>
      <aside>
        <div className="brand"><span>CE</span><div>CRA Evidence OS<small>Build Week demo</small></div></div>
        <nav aria-label="Demo workflow">
          {steps.map((item, index) => (
            <button key={item} className={step === index ? "active" : ""} onClick={() => setStep(index)}>
              <b>0{index + 1}</b>{item}
            </button>
          ))}
        </nav>
        <div className="guardrail">AI assists. People decide.<small>This measures evidence readiness - not legal compliance.</small></div>
      </aside>
      <section className="shell">
        <header>
          <div><small>AEGIS LABS / CONNECTED PRODUCTS</small><h1>AegisEdge Gateway <em>v2.3</em></h1></div>
          <div className="metrics" aria-label="Operational evidence status">
            <span><b>12</b>approved claims</span><span className="warn"><b>2</b>stale items</span>
            <span><b>1</b>incident field missing</span><span><b>4</b>export files verified</span>
          </div>
        </header>
        <div className="demo-banner" role="note">
          <b>PUBLIC SYNTHETIC JUDGE DEMO</b>
          <span>Fixed repository-owned evidence | real server-side GPT-5.6 | non-persistent review session</span>
        </div>

        {step === 0 && (
          <article>
            <section className="hero">
              <div>
                <div className="eyebrow">CRA EVIDENCE CONTROL PLANE</div>
                <h2>When your product changes, can you prove what is still true?</h2>
                <p>For small EU software, IoT and industrial-equipment manufacturers, scattered documents turn every release and security incident into a manual evidence hunt. CRA Evidence OS connects claims to exact sources, detects stale evidence and prepares review-ready records.</p>
                <div className="hero-tags"><span>Guided synthetic case</span><span>Live GPT-5.6</span><span>Human approval required</span></div>
              </div>
              <div className="before-after">
                <section><label>DISCONNECTED PROCESS</label><b>5 evidence steps</b><p>Find sources, reconcile versions, trace dependencies, prepare incident facts and package exports.</p></section>
                <i>-&gt;</i>
                <section><label>WITH EVIDENCE OS</label><b>1 traced workflow</b><p>Review grounded suggestions and only the claims affected by change.</p></section>
              </div>
            </section>
            <div className="eyebrow">EVIDENCE INBOX | GUIDED CASE</div>
            <h2>Document -&gt; GPT-5.6 -&gt; cited suggestion -&gt; human decision</h2>
            <p>The model proposes; the reviewer compares it with the exact source and owns the decision. This demo accepts only one pre-verified synthetic case and does not claim arbitrary PDF parsing.</p>
            <div className="intake-row">
              <button className="reject" onClick={loadSynthetic} disabled={!hydrated}>Load synthetic evidence</button>
              <a className="source-link" href={`${DEMO_SOURCE}#page=4`} target="_blank" rel="noreferrer">Open cited PDF | page 4</a>
              <button className="live-run" onClick={extract} disabled={!caseReady || extractState === "loading"}>
                {extractState === "loading" ? "Extracting..." : "Extract with GPT-5.6"}
              </button>
            </div>
            <p className="upload-status">{sourceStatus}</p>
            <p className={`ai-status ${extractState}`} role="status" aria-live="polite">{extractState.toUpperCase()} | {extractMessage}</p>
            <div className="split">
              <section className="source">
                <label>VERIFIED SOURCE FRAGMENT | PAGE 4 | PARAGRAPH 2</label>
                <h3>AegisEdge security architecture</h3>
                <p>&quot;All administrative traffic is protected using <mark>mutual TLS 1.3. Device identities are provisioned during manufacturing and rotated every 90 days.</mark> Failed authentication attempts are rate limited and recorded.&quot;</p>
                <footer>aegisedge-architecture-v2.3.pdf | architecture-v2.3:p4:p2</footer>
              </section>
              <section className="suggestion">
                <label>{suggestion ? "LIVE GPT-5.6 OUTPUT" : "AWAITING LIVE EXTRACTION"}</label>
                {suggestion ? (
                  <>
                    <h3>{suggestion.targetField}</h3><p>{suggestion.proposedValue}</p>
                    <dl>
                      <div><dt>Source</dt><dd>{suggestion.sourceFragmentId}</dd></div>
                      <div><dt>Confidence</dt><dd>{suggestion.confidence.toFixed(2)}</dd></div>
                      <div><dt>Model</dt><dd>{meta?.model}</dd></div>
                      <div><dt>Response</dt><dd className="response-id">{meta?.responseId}</dd></div>
                      <div><dt>Status</dt><dd className={approved ? "ok" : "warn"}>{approved ? "APPROVED IN DEMO SESSION" : "SUGGESTED"}</dd></div>
                    </dl>
                    <div className="actions"><button className="reject" onClick={() => setApproved(false)}>Reject</button><button className="approve" onClick={approve} disabled={approved}>Approve claim</button></div>
                  </>
                ) : <div className="empty-state"><b>No GPT result is being simulated.</b><p>Load the guided source and run the server-side extraction.</p></div>}
              </section>
            </div>
          </article>
        )}

        {step === 1 && (
          <article>
            <div className="eyebrow">EVIDENCE GRAPH</div><h2>Every claim has a verifiable lineage</h2>
            <div className="graph"><div>CRA REQUIREMENT<small>Annex I Part I (3)(d)</small></div><i>-&gt;</i><div className={approved ? "good" : "pending"}>CLAIM<small>{approved ? "Approved in this non-persistent judge session" : "No approved live suggestion"}</small></div><i>-&gt;</i><div>SOURCE FRAGMENT<small>Page 4 | paragraph 2</small></div><i>-&gt;</i><div>ARTIFACT<small>aegisedge-architecture-v2.3.pdf</small></div></div>
            <p className="note">Customer workspaces use authenticated, tenant-scoped, append-only approvals. This public judge flow is isolated and non-persistent.</p>
          </article>
        )}

        {step === 2 && (
          <article>
            <div className="eyebrow">SBOM DELTA | VERSION 2.3 -&gt; 2.4</div><h2>One component changed. Two claims need attention.</h2>
            <p>Application code has already computed the blast radius. GPT-5.6 can explain review priority, but cannot alter the stale set.</p>
            <div className="delta"><b>openssl</b><del>3.0.12</del><span>-&gt;</span><ins>3.0.14</ins><strong>UPDATED</strong></div>
            <div className="cards"><div><span className="stale">! STALE</span><h3>Secure administrative communications</h3><p>Linked through the TLS runtime dependency.</p></div><div><span className="stale">! STALE</span><h3>Cryptographic update policy</h3><p>Evidence references the previous component snapshot.</p></div><div><span className="ok">CURRENT</span><h3>Access logging</h3><p>No graph path to the changed component.</p></div></div>
            <button className="live-run inline-run" onClick={explainImpact} disabled={impactState === "loading"}>{impactState === "loading" ? "Explaining..." : "Explain deterministic impact with GPT-5.6"}</button>
            <p className={`ai-status ${impactState}`} role="status" aria-live="polite">{impactMessage}</p>
            {impact && <section className="model-result"><label>GPT-5.6 EXPLANATION | SUGGESTED</label><p>{impact.explanation}</p><b>Review priorities</b><ul>{impact.reviewPriorities.map((item) => <li key={item}>{item}</li>)}</ul><small>Cited graph nodes: {impact.citedNodeIds.join(", ")}</small></section>}
          </article>
        )}

        {step === 3 && (
          <article>
            <div className="eyebrow">INCIDENT WORKSHEET | HUMAN REVIEW REQUIRED</div><h2>24h / 72h reporting facts, prepared - not submitted</h2>
            <div className="deadline-strip"><b>24h</b><span>Early warning facts</span><i>-&gt;</i><b>72h</b><span>Notification details</span></div>
            <div className="worksheet"><div><label>Product</label><b>AegisEdge Gateway 2.3</b></div><div><label>Awareness time</label><b>2026-07-19 08:15 UTC</b></div><div><label>Incident summary</label><b>Authentication bypass under investigation</b></div><div><label>Exploitation observed</label><b className="warn">? Unknown | confirmation required</b></div></div>
            <button className="live-run inline-run" onClick={draftIncident} disabled={incidentState === "loading"}>{incidentState === "loading" ? "Drafting..." : "Draft worksheet with GPT-5.6"}</button>
            <p className={`ai-status ${incidentState}`} role="status" aria-live="polite">{incidentMessage}</p>
            {incident && <section className="model-result"><label>GPT-5.6 INCIDENT DRAFT | SUGGESTED</label><dl>{Object.entries(incident.fields).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value ?? "Unknown"}</dd></div>)}</dl><b>Missing information</b><ul>{incident.missingInformation.map((item) => <li key={item}>{item}</li>)}</ul><small>Approved fact citations: {incident.citations.join(", ")}</small></section>}
            <p className="note">No ENISA API call is made. Export is copy-ready and requires explicit human submission.</p>
          </article>
        )}

        {step === 4 && (
          <article>
            <div className="eyebrow">ANNEX VII MINI-DOSSIER</div><h2>A reproducible package with integrity metadata</h2>
            <div className="manifest"><div><b>technical-dossier.pdf</b><code>SHA-256 in manifest</code></div><div><b>evidence-index.json</b><code>Reviewed source lineage</code></div><div><b>sbom.cdx.json</b><code>CycloneDX 1.6</code></div><div><b>manifest.json</b><code>4 files | DRAFT</code></div></div>
            <div className="actions"><a className="reject download" href="/demo-export/technical-dossier.pdf" download>Download PDF</a><a className="approve download" href="/demo-export/aegisedge-annex-vii-draft.zip" download>Download ZIP package</a></div>
            <p className="note">DRAFT - NOT APPROVED. Stale or unsupported claims remain visibly flagged.</p>
          </article>
        )}

        <footer className="stepper"><span>Demo workflow</span><b>{step + 1} / {steps.length}</b><button disabled={step === steps.length - 1} onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>Next step -&gt;</button></footer>
      </section>
    </main>
  );
}
