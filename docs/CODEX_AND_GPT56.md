# How Codex and GPT-5.6 are used

## Codex during Build Week

The repository began at commit `e46828b` with a placeholder README. The primary Codex task was used to turn the idea into the contest vertical slice:

- reduce the product to one traceable evidence workflow;
- define the threat model and trust boundaries;
- implement tenant-scoped storage, validation, and audit behavior;
- connect three server-side GPT-5.6 use cases to the interface;
- keep stale-state decisions deterministic and review decisions human-owned;
- create fixed synthetic source artifacts and physical dossier exports;
- add unit, security, integration, eval, Playwright, and build checks;
- diagnose the hosted environment, recover deployment, and prepare submission evidence.

The required main Codex task was submitted through `/feedback`; its Session ID is recorded in the submission materials. No claim is made that Codex independently certified the application or its regulatory interpretation.

## GPT-5.6 at runtime

GPT-5.6 is a product dependency for three bounded tasks:

1. **Evidence extraction:** propose one claim from a known source fragment.
2. **Impact explanation:** explain a stale set that deterministic graph code has already selected.
3. **Incident drafting:** structure only approved facts and preserve missing facts as unknown.

Each use case has its own strict JSON Schema. The adapter calls the Responses API on the server with `store: false` and reasoning effort `medium`, validates the returned JSON locally, and returns safe metadata including the actual model ID and provider response ID. Prompts instruct the model to treat documents as untrusted data.

## Decision boundary

```text
+-----------------------+-----------------------------+
+| Model may             | Model may not               |
++-----------------------+-----------------------------+
+| propose a claim       | approve evidence            |
+| cite known IDs        | invent source identifiers   |
+| explain stale impact  | decide the stale set        |
+| draft known facts     | fill unknown incident facts |
+| expose warnings       | submit an incident          |
++-----------------------+-----------------------------+
+```

The public judge route is a non-persistent fixed synthetic case. It exists so judges can exercise the same server-side model adapter without an account. The authenticated product route remains user- and tenant-scoped and persists review decisions.
