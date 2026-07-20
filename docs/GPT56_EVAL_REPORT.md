# GPT-5.6 eval report

## Automated checks

The synthetic gold suite covers grounded extraction, missing-evidence abstention, document prompt injection, graph-grounded impact explanation, and preservation of unknown incident facts.

Verified on 2026-07-20:

- ESLint: pass;
- TypeScript: pass;
- unit and synthetic gold tests: 12/12 pass;
- mocked Responses API integration: 2/2 pass;
- hosted Playwright E2E: 2/2 pass;
- production build: pass.

The mocked Responses API integration test verifies:

- request model `gpt-5.6-sol` and reasoning effort `medium`;
- strict JSON Schema output configuration;
- schema-valid structured output;
- a known `sourceFragmentId`;
- safe return metadata (`responseId`, actual model, provider response status, and review status);
- no API key, Authorization header, or prompt returned by the adapter.

The hosted E2E test uses explicit route mocks for UI model/upload responses and does not represent them as a live GPT result. It also confirms that an identity-less request is rejected by the deployed API.

## Live status

Status on 2026-07-20: **not run successfully**. The expected server-side variable name `OPENAI_API_KEY` is not present in the current Sites environment, so no live model response ID or live model result is claimed.

The live smoke test uses only synthetic content and fails closed: no fixture is substituted and no secret value is emitted or persisted in its report.