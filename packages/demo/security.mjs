export const DEMO_CASES = Object.freeze({
  evidence: "aegisedge-architecture-v2.3",
  impact: "sbom-2.3-2.4",
  incident: "incident-aegis-001",
});

export const DEMO_SOURCE_FRAGMENT_ID = "architecture-v2.3:p4:p2";

const allowedFields = Object.freeze({
  evidence: ["caseId"],
  impact: ["caseId"],
  incident: ["caseId"],
  approve: ["caseId", "responseId"],
});

export function validateDemoInput(useCase, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "A JSON object is required." };
  }
  const fields = allowedFields[useCase];
  if (!fields || Object.keys(value).some((key) => !fields.includes(key))) {
    return { ok: false, error: "Unknown demo input fields are not allowed." };
  }
  const expectedCase = useCase === "approve" ? DEMO_CASES.evidence : DEMO_CASES[useCase];
  if (value.caseId !== expectedCase) {
    return { ok: false, error: "Unknown synthetic demo case." };
  }
  if (useCase === "approve") {
    if (typeof value.responseId !== "string"
      || !/^resp_[A-Za-z0-9_-]{8,120}$/.test(value.responseId)) {
      return { ok: false, error: "A valid demo responseId is required." };
    }
  }
  return { ok: true, data: value };
}

export function isSameOrigin(requestUrl, origin) {
  if (typeof origin !== "string" || origin.length > 256) return false;
  try {
    return new URL(requestUrl).origin === new URL(origin).origin;
  } catch {
    return false;
  }
}

export function containsSensitiveMetadata(value) {
  const serialized = JSON.stringify(value).toLowerCase();
  return serialized.includes("openai_api_key")
    || serialized.includes("authorization")
    || serialized.includes("bearer ")
    || serialized.includes("@");
}
