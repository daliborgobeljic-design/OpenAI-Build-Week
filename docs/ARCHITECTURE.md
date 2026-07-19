# Architecture
Reduced modular web application for the deadline: Vinext/Next-compatible UI and routes, pure domain modules, D1-compatible relational schema, R2-compatible artifact boundary, and a Responses API adapter. AI has no domain write capability.

`untrusted artifact → local validation/extraction → minimal fragments → structured suggestion → human approval → evidence graph → deterministic delta/stale → draft export`

ADR-001: use a single deployable application for BW0–BW3; preserve module boundaries and defer worker isolation/queues to production hardening.
