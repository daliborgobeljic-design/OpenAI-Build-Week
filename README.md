# CRA Evidence OS

[Live application](https://cra-evidence-os-build-week.perapericmika.chatgpt.site) | [Public repository](https://github.com/daliborgobeljic-design/OpenAI-Build-Week)

OpenAI Build Week Work & Productivity entry: a traceable evidence workflow for EU Cyber Resilience Act preparation. It turns a controlled synthetic product document and SBOM delta into grounded GPT-5.6 suggestions, explicit human decisions, a change-aware Evidence Graph, an incident worksheet, and a draft Annex VII package.

> Evidence readiness is not legal compliance. AI never approves claims, decides stale state, or submits incidents.

## Try the public judge demo

No account, tenant setup, or payment is required.

1. Open the [live application](https://cra-evidence-os-build-week.perapericmika.chatgpt.site).
2. Select **Load synthetic evidence**, then **Extract with GPT-5.6**.
3. Compare the suggestion with the linked PDF at page 4, paragraph 2. The result remains `SUGGESTED` until **Approve claim** is selected.
4. Open **SBOM impact** and ask GPT-5.6 to explain the code-computed stale set.
5. Open **Incident draft** and generate a worksheet from approved synthetic facts. The unknown exploitation field stays unknown and nothing is submitted.
6. Open **Dossier** to download the physical PDF and ZIP package.

The public path is deliberately constrained to repository-owned synthetic case IDs. It is isolated, non-persistent, same-origin only, rate limited per hashed client address, and never accepts arbitrary prompts or tenant identifiers. The authenticated `/api/v1/ai/*` workspace routes remain tenant scoped and unchanged.

## What is real

- The deployed app calls the OpenAI Responses API from the server only.
- The configured runtime model is `gpt-5.6-sol`, with reasoning effort `medium`, strict Structured Outputs, and `store: false`.
- The returned model ID and provider response ID are displayed in the review UI.
- Structured output is validated locally and checked against known source, graph, or fact identifiers.
- The human reviewer owns the approval decision.
- Application code, not the model, determines which evidence is `STALE`.
- The incident use case creates a draft only and makes no external submission.

This is a guided synthetic vertical slice, not a claim that every PDF can be parsed. It does not measure or claim a universal time saving.

## Architecture

```text
Browser
  |-- public fixed-case demo --> /api/v1/demo/* -- same-origin + rate limit --+
  |-- authenticated workspace -> /api/v1/ai/* -- user + tenant checks -------+--> runStructured()
                                                                                |   OpenAI Responses API
                                                                                |   strict JSON Schema
                                                                                +--> schema + citation validation
                                                                                     human review / draft UI

Cloudflare D1: tenant records, audit events, hashed demo rate counters
Cloudflare R2: authenticated workspace artifacts
Repository assets: fixed synthetic judge PDF and downloadable demo package
```

## Server-side routes

Authenticated workspace:

- `POST /api/v1/ai/evidence` extracts from a known source fragment and persists `SUGGESTED`.
- `POST /api/v1/ai/approve` records a separate authenticated reviewer decision.
- `POST /api/v1/ai/impact` explains a deterministic SBOM blast radius.
- `POST /api/v1/ai/incident` drafts only from approved facts and never submits.
- `GET /api/v1/ai/health` exposes configuration presence and safe model metadata only.

Public judge demo:

- `POST /api/v1/demo/evidence`
- `POST /api/v1/demo/approve`
- `POST /api/v1/demo/impact`
- `POST /api/v1/demo/incident`

Inputs reject unknown fields and case IDs. API responses never include the API key, Authorization header, or complete prompt. Production has no silent fixture fallback.

## Run locally

Requires Node.js 22+.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Real model calls require a server-side `OPENAI_API_KEY`. Do not expose it through client code or logs.

## Verify

```bash
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run test:ai-evals
npm run test:ai-evals:live
npm run test:e2e
npm run build
npm run demo:reset
```

The integration suite mocks only the OpenAI HTTP boundary. The Playwright suite mocks the public API routes to test UI state transitions. Neither is described as a live model result. Live hosted evidence and its limitations are recorded in [docs/GPT56_EVAL_REPORT.md](docs/GPT56_EVAL_REPORT.md).

## Build Week slice and Codex

The repository began at commit `e46828b` with a placeholder README. The contest implementation after that commit was produced in the primary Codex task: product scoping, architecture, threat boundaries, deterministic domain rules, server-side GPT-5.6 adapters, UI, synthetic artifacts, tests, deployment recovery, and submission materials. GPT-5.6 is the runtime product dependency for three bounded tasks: grounded extraction, impact explanation, and incident drafting.

See [docs/CODEX_AND_GPT56.md](docs/CODEX_AND_GPT56.md), [docs/DEVPOST_SUBMISSION_EN.md](docs/DEVPOST_SUBMISSION_EN.md), and [docs/JUDGING_EVIDENCE_MATRIX.md](docs/JUDGING_EVIDENCE_MATRIX.md).

## Security boundaries and limitations

- Synthetic data only; no production customer data is included.
- Documents are untrusted input and document instructions are ignored.
- No arbitrary URL fetch, code execution, compliance verdict, or automatic regulatory submission.
- Public judge decisions are intentionally non-persistent; authenticated tenant approvals use D1 audit records.
- The demo has an application rate limit, but the project owner should also maintain a hosting-level OpenAI spend limit.
- The controlled demo covers one architecture source, one SBOM delta, and one incident case; broader ingestion and production IAM are future work.

## Submission links

- Source: https://github.com/daliborgobeljic-design/OpenAI-Build-Week
- Live demo: https://cra-evidence-os-build-week.perapericmika.chatgpt.site
- License: MIT
- Track: Work & Productivity

The replacement narrated video URL will be added after its public YouTube upload.
