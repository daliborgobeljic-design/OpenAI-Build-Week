# GPT-5.6 evaluation report

## Final local recovery checks

Verified on 2026-07-20 against the recovery working tree:

| Check | Result |
| --- | --- |
| ESLint | PASS |
| TypeScript | PASS |
| Unit, security, domain, and combined tests | 17/17 PASS |
| Mocked Responses API integration | 2/2 PASS |
| Synthetic AI gold evals | 5/5 PASS |
| Playwright UI workflow | 2/2 PASS |
| Production Vinext build | PASS |
| Deterministic demo reset | PASS |

The Playwright workflow starts a production build in a local Cloudflare Worker. It mocks the fixed PDF bytes and the four public API responses to validate browser state transitions. It is a UI contract test and is not presented as a live GPT-5.6 result.

## What the mocked integration proves

The mock is placed only at the OpenAI HTTP boundary and verifies:

- request model `gpt-5.6-sol`;
- reasoning effort `medium`;
- `store: false`;
- strict JSON Schema output configuration;
- schema-valid structured output;
- provider-shaped response metadata;
- a known `sourceFragmentId`;
- status `SUGGESTED`;
- absence of the test secret from returned adapter data;
- rejection of unknown output fields.

## Hosted live verification

A real hosted evidence extraction was successfully completed before the public judge recovery deployment.

| Field | Observed value |
| --- | --- |
| Hosted route event | `POST /api/v1/ai/evidence` returned HTTP 200 |
| UTC timestamp | `2026-07-20T10:48:26.632Z` |
| Model returned by provider | `gpt-5.6-sol` |
| Provider response ID | `resp_0f8f7629d81c5d83016a5deedeb2e4819da2edac3f5699e33f` |
| Source fragment | `architecture-v2.3:p4:p2` |
| Confidence | `1.00` |
| Review status before action | `SUGGESTED` |
| Local schema validation | PASS |
| Known-fragment validation | PASS |

The same hosted workflow recorded HTTP 200 events for approval, impact explanation, and incident drafting at `2026-07-20T10:48:35.140Z`, `2026-07-20T10:48:48.292Z`, and `2026-07-20T10:49:09.350Z`.

The observed UI response contained only structured output and safe model/review metadata. The inspected Worker event records contained route/status metadata, not an API key, Authorization header, or complete prompt. No secret value was read to make this determination.

## Public judge live smoke

PASS on 2026-07-20 against Sites checkpoint v4, commit `6ff44f5a5af826d924f6c18aaf284a1b4ecd4cd9`, from a new browser context with no account cookies or tenant setup.

| Use case | Model | Provider response ID | Safety result |
| --- | --- | --- | --- |
| Evidence | `gpt-5.6-sol` | `resp_061a2728df2dd9f9016a5e6e31d3fc81a2885563b877dc52b2` | Schema valid, known fragment, `SUGGESTED` |
| Impact | `gpt-5.6-sol` | `resp_0f0fcafdb096574d016a5e6e34ee108192bb1ffbd699eef539` | All citations in deterministic graph allowlist |
| Incident | `gpt-5.6-sol` | `resp_0286a92439b1a596016a5e6e3a0fa081a3bea39c3f6cd6bf5f` | Unknown preserved, `submitted=false` |

Additional assertions:

- the authenticated health route returned `401` to the clean browser;
- the public evidence result stayed `SUGGESTED` until a separate approval POST;
- approval was marked `NON_PERSISTENT`;
- the evidence source was `architecture-v2.3:p4:p2` with confidence `1.00`;
- the PDF download returned `200` and 2,289 bytes;
- the ZIP download returned `200` and 2,886 bytes;
- no API key field name, Authorization header, bearer token, or complete prompt appeared in any captured API response.

Three successful real public model calls also confirm that the server-side deployment sees the configured provider credential. Its value was never read or printed. Production has no fixture fallback; provider or configuration failures remain explicit errors.
