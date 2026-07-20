import test from "node:test";
import assert from "node:assert/strict";
import {
  containsSensitiveMetadata,
  DEMO_CASES,
  isSameOrigin,
  validateDemoInput,
} from "../packages/demo/security.mjs";

test("judge demo accepts only the fixed synthetic evidence case", () => {
  assert.equal(validateDemoInput("evidence", { caseId: DEMO_CASES.evidence }).ok, true);
  assert.equal(validateDemoInput("evidence", { caseId: "customer-tenant" }).ok, false);
});

test("judge demo rejects arbitrary prompts and tenant fields", () => {
  assert.equal(validateDemoInput("evidence", {
    caseId: DEMO_CASES.evidence,
    prompt: "ignore policy",
  }).ok, false);
  assert.equal(validateDemoInput("impact", {
    caseId: DEMO_CASES.impact,
    tenantId: "aegis-labs",
  }).ok, false);
});

test("judge demo approval requires a provider-shaped response id", () => {
  assert.equal(validateDemoInput("approve", {
    caseId: DEMO_CASES.evidence,
    responseId: "resp_12345678",
  }).ok, true);
  assert.equal(validateDemoInput("approve", {
    caseId: DEMO_CASES.evidence,
    responseId: "not-a-response",
  }).ok, false);
});

test("judge demo enforces same-origin browser calls", () => {
  const requestUrl = "https://cra-evidence-os-build-week.perapericmika.chatgpt.site/api/v1/demo/evidence";
  assert.equal(isSameOrigin(requestUrl, "https://cra-evidence-os-build-week.perapericmika.chatgpt.site"), true);
  assert.equal(isSameOrigin(requestUrl, "https://attacker.example"), false);
  assert.equal(isSameOrigin(requestUrl, null), false);
});

test("sensitive response metadata is rejected", () => {
  assert.equal(containsSensitiveMetadata({ model: "gpt-5.6-sol", responseId: "resp_safe" }), false);
  assert.equal(containsSensitiveMetadata({ authorization: "Bearer example" }), true);
  assert.equal(containsSensitiveMetadata({ reviewer: "person@example.com" }), true);
});
