# Narrated demo script

Target runtime: 2:40 to 2:50. Language: English. Use the deployed public judge URL in a clean browser. Record at 1920x1080 with clear narration and no background music.

## Word-for-word narration and shot list

**0:00-0:16 - Landing and problem**

Show the landing screen and public synthetic judge banner.

"Product teams preparing for the EU Cyber Resilience Act often have the evidence, but not the traceability. A product change can invalidate a claim, and an incident can turn scattered documents into a time-critical search. CRA Evidence OS creates one reviewable path from source to claim, change impact, incident facts, and dossier."

**0:16-0:34 - Codex and GPT-5.6**

Keep the headline and guardrail visible.

"I built this Build Week vertical slice with Codex. Codex helped scope the product, implement the server-side architecture, threat boundaries, deterministic graph rules, tests, deployment, and submission evidence. GPT-5.6 is the runtime model for three bounded tasks. It proposes; application code and people decide."

**0:34-1:15 - Live evidence extraction**

Select **Load synthetic evidence**, open the cited PDF at page 4, return to the app, and select **Extract with GPT-5.6**. Pause on the model and response metadata.

"This public judge path needs no account. It accepts only this repository-owned synthetic PDF and never accepts an arbitrary prompt. The server calls the OpenAI Responses API with strict Structured Outputs. Here is the exact source fragment, the grounded suggestion, its confidence, the returned model ID, and a real provider response ID. There is no fixture fallback in production. The result is still suggested. I compare it with page four, paragraph two, and then make the separate human approval."

Select **Approve claim**.

**1:15-1:36 - Evidence Graph**

Open **Evidence graph**.

"The graph preserves lineage from the CRA requirement to the reviewed claim, exact source fragment, and source artifact. Public judge approval is intentionally non-persistent. Authenticated customer workspaces use tenant-scoped records and audit events."

**1:36-2:03 - SBOM impact**

Open **SBOM impact**, show the OpenSSL delta and three claim cards, then select **Explain deterministic impact with GPT-5.6**.

"When the SBOM changes, deterministic graph code marks only two connected claims stale. GPT-5.6 explains why reviewers should prioritize them, but it cannot add to or remove from the stale set. Access logging remains current because no graph path connects it to the changed component."

**2:03-2:26 - Incident worksheet**

Open **Incident draft** and select **Draft worksheet with GPT-5.6**.

"The incident worksheet uses only approved synthetic facts. Missing exploitation evidence stays unknown instead of being invented. The output is suggested, human review is required, and the app never sends a regulatory notification."

**2:26-2:42 - Dossier**

Open **Dossier** and show the PDF and ZIP download controls.

"The final step produces physical PDF and ZIP artifacts with an evidence index, CycloneDX SBOM, and SHA-256 manifest. They remain visibly marked draft when evidence is stale or unsupported."

**2:42-2:50 - Close**

Return to the top-level guardrail.

"CRA Evidence OS measures evidence readiness, not legal compliance. It makes every AI suggestion inspectable, bounded, and owned by a person."

## Recording acceptance checks

- Total duration is below 3:00.
- Voice is understandable at normal volume.
- The live model ID and response ID are readable.
- Codex and GPT-5.6 contributions are both spoken.
- The video never displays secrets, private account data, browser history, or hosting controls.
- The final upload is public on YouTube and opens without sign-in.
