# GPT-5.6 eval report
Five synthetic gold checks cover grounded extraction, missing-evidence abstention, document prompt injection, impact graph citation, and preservation of unknown incident facts. The deterministic fixture contract currently passes locally through `pnpm test:ai-evals`; live-model measurements require an authorized API key and must record schema validity and citation coverage without logging document text.

Live status on 2026-07-19: **not run - API key unavailable**. The repository fails closed through `pnpm test:ai-evals:live`; it never substitutes a fixture result or claims that a live response was measured.
