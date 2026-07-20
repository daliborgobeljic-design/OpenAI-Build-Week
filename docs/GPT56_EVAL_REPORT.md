# GPT-5.6 eval report

## Automated checks

The synthetic gold suite covers grounded extraction, missing-evidence abstention, document prompt injection, graph-grounded impact explanation, and preservation of unknown incident facts.

The mocked Responses API integration test verifies:

- request model `gpt-5.6-sol` and reasoning effort `medium`;
- strict JSON Schema output configuration;
- schema-valid structured output;
- a known `sourceFragmentId`;
- safe return metadata (`responseId`, actual model, provider response status, and review status);
- no API key, Authorization header, or prompt returned by the adapter.

## Live status

Status on 2026-07-20: **pending the new Sites deployment**. The production secret was reported as configured by the project owner, but this report does not claim a successful live call until the newly deployed server route returns a real response ID and the smoke assertions pass.

The live smoke test uses only synthetic content and fails closed: no fixture is substituted and no secret value is emitted or persisted in its report.