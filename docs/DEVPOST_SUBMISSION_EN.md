# Devpost submission copy

## Project title

CRA Evidence OS

## Tagline

From product evidence to cited GPT-5.6 suggestions, human decisions, change impact, and a review-ready dossier.

## Track

Work & Productivity

## Inspiration

Teams building connected products already have architecture documents, SBOMs, security claims, and incident facts. The problem is that these items live in different tools and lose their relationships as the product changes. A component update can make evidence stale, and an incident can force a time-critical search for facts. We wanted a focused system that helps a small team preserve traceability without pretending that AI can certify compliance.

## What it does

CRA Evidence OS demonstrates a five-step evidence workflow with controlled synthetic data:

1. A repository-owned architecture PDF is loaded and verified.
2. GPT-5.6 proposes a structured claim with an exact source fragment.
3. A reviewer compares the source and makes a separate approval decision.
4. Deterministic Evidence Graph logic identifies claims affected by an SBOM change; GPT-5.6 explains the result.
5. GPT-5.6 drafts an incident worksheet from approved facts, preserving unknown information, and the app generates a draft PDF and ZIP dossier.

The public judge path is free, requires no account, is non-persistent, and accepts only fixed synthetic case identifiers. It does not claim arbitrary PDF parsing or a compliance verdict.

## How we built it

The application is a Next.js/Vinext interface deployed with ChatGPT Sites on Cloudflare. D1 stores tenant data, audit events, and hashed public-demo rate counters; R2 stores authenticated workspace artifacts.

The server-only GPT adapter calls the OpenAI Responses API with `gpt-5.6-sol`, reasoning effort `medium`, `store: false`, and strict JSON Schema outputs. Every response is validated locally. Inputs are limited to known source fragments, graph nodes, and approved facts. The API never returns the key, Authorization header, or complete prompt.

Codex was the Build Week development environment. It helped scope the vertical slice, implement the application and security boundaries, write tests, generate synthetic artifacts, diagnose deployment, and assemble verifiable submission materials.

## Challenges

The hardest boundary was making the public demo easy for judges without weakening authenticated tenant routes. We created a separate same-origin public namespace that only accepts three fixed synthetic cases, stores no review decision, hashes the client address for a short rate-limit window, and reuses the real server-only GPT adapter.

A second challenge was keeping AI useful without giving it authority. Stale state is computed by graph code, evidence remains suggested until a human action, missing incident facts remain unknown, and no incident is submitted.

## Accomplishments

- Three live, schema-constrained GPT-5.6 product use cases.
- Exact source and graph citations checked against allowlisted IDs.
- Separate human review and non-persistent public judge approval.
- Deterministic SBOM blast-radius logic.
- Physical PDF and ZIP evidence packages with SHA-256 integrity metadata.
- Security, integration, eval, Playwright, and production-build coverage.
- A public judge flow that does not require credentials or payment.

## What we learned

Structured output solves format reliability, not decision authority. Useful evidence automation also needs deterministic domain rules, citation validation, explicit unknowns, review state, and a record of what the model did not decide.

## What is next

Broaden ingestion beyond the controlled demo, add production organization administration, support more evidence and SBOM formats, expand deterministic CRA mappings, and run measured pilots before making any productivity claim.

## Built with

OpenAI GPT-5.6, OpenAI Responses API, Structured Outputs, Codex, ChatGPT Sites, Next.js, Vinext, React, TypeScript, Cloudflare Workers, D1, R2, Playwright, Node.js, and Python.

## Links

- Live application: https://cra-evidence-os-build-week.perapericmika.chatgpt.site
- Source: https://github.com/daliborgobeljic-design/OpenAI-Build-Week
- License: MIT
- Video: https://www.youtube.com/watch?v=npGYuF5sQwQ

## Judge instructions

Open the live application in a clean browser. Select **Load synthetic evidence**, then **Extract with GPT-5.6**. Compare the output with the linked PDF page and select **Approve claim**. Continue through **SBOM impact**, **Incident draft**, and **Dossier**. The public workflow is intentionally fixed, synthetic, free, and non-persistent.

## Codex feedback Session ID

`019f7b26-9b87-7ff3-9237-70f028af5996`

## Known limitations

The submission is a controlled synthetic vertical slice. It does not parse arbitrary PDFs, provide legal advice, certify CRA compliance, scan software, or submit regulatory notifications. Public judge approvals are non-persistent. Broader ingestion, enterprise IAM, measurement, and operational regulatory integrations are future work.
