# Judging evidence matrix

| Requirement or judging question | Evidence | How to verify | Status |
| --- | --- | --- | --- |
| Functional public application | Sites deployment and five-step UI | Open the live URL in a clean browser and complete all five steps | Reverify after final deploy |
| Free judge access | Separate `/api/v1/demo/*` namespace | No login, payment, tenant, or credentials are requested | Implemented; live recheck pending |
| Real GPT-5.6 integration | Server-only `runStructured()`; model and provider ID displayed | Run evidence extraction and inspect returned metadata | Hosted authenticated call verified; public path recheck pending |
| Grounded evidence suggestion | Fixed source fragment `architecture-v2.3:p4:p2` | Open PDF page 4 and compare paragraph 2 | Implemented |
| Human decision | Suggestion remains `SUGGESTED` before approval | Observe state before and after **Approve claim** | Implemented |
| Deterministic stale state | Domain graph selects two linked claims | Open SBOM impact before requesting an explanation | Implemented |
| Incident safety | Approved facts only; unknown exploitation remains unknown | Generate the worksheet and inspect missing information | Implemented |
| No automatic submission | Incident screen and route return a draft only | Observe `SUGGESTED, not submitted` state | Implemented |
| Physical artifacts | PDF, ZIP, evidence index, SBOM, SHA-256 manifest | Download both files from Dossier | Generated; live recheck pending |
| Secret boundary | Server-only environment access and response metadata filter | Review routes/tests; no key is returned by health or AI APIs | Implemented |
| Abuse boundary | Same-origin, fixed IDs, unknown-field rejection, hashed per-IP limit | Review `packages/demo/security.mjs` and security tests | Implemented |
| Automated quality | lint, typecheck, unit, integration, eval, Playwright, build | Run commands in README | Final rerun pending |
| Codex use | Repository history and `docs/CODEX_AND_GPT56.md` | Review commits after `e46828b` | Documented |
| `/feedback` evidence | Primary Codex Session ID | Match Devpost field to `019f7b26-9b87-7ff3-9237-70f028af5996` | Confirmed |
| Public narrated video | English script and final YouTube URL | Verify audio, content, public access, and duration below 3:00 | Replacement pending |
| Public source and license | GitHub repository and MIT license | Open repository while signed out | Existing; final push pending |

## Hosted verification record available before recovery deployment

At `2026-07-20T10:48:26.632Z`, the authenticated hosted evidence route returned HTTP 200. The review UI displayed:

- model: `gpt-5.6-sol`;
- provider response ID: `resp_0f8f7629d81c5d83016a5deedeb2e4819da2edac3f5699e33f`;
- source fragment: `architecture-v2.3:p4:p2`;
- confidence: `1.00`;
- status before reviewer action: `SUGGESTED`.

The same hosted workflow recorded successful approval, impact, and incident route events at `2026-07-20T10:48:35.140Z`, `2026-07-20T10:48:48.292Z`, and `2026-07-20T10:49:09.350Z`. This is evidence of the authenticated production flow. The separate anonymous judge path must be verified again after its final deployment.

No secret value, Authorization header, complete prompt, private account identifier, or raw client address is included in this record.
