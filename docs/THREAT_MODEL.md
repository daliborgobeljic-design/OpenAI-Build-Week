# Threat model
| Threat | Build Week control | Remaining production work |
|---|---|---|
| Tenant theft / IDOR | server tenant context; negative smoke test | D1 row policies and full matrix |
| Malicious upload / parser escape | synthetic allowlist; no execution | isolated parser, AV, quotas |
| Prompt injection | documents declared untrusted; system boundary; eval | adversarial corpus |
| Evidence/SBOM poisoning | hashes, source IDs, human approval | signatures and provenance |
| Reviewer session theft | role check, attributed approval | MFA/re-authentication |
| Incident timestamp tampering | approved facts and audit model | append-only privileged endpoint |
| AI/OCR denial of service | no silent retries; planned limits | per-tenant budgets/queue |
| Audit/manifest forgery | deterministic SHA-256 manifest | hash chain and Ed25519 integrity signature |
