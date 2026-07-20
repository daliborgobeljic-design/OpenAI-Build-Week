type StringRule = { type: "string"; minLength?: number; enum?: readonly string[] };
type ObjectSchema = {
  type: "object";
  additionalProperties: false;
  required: readonly string[];
  properties: Record<string, StringRule>;
};

export const aiInputSchemas = {
  evidence: {
    type: "object",
    additionalProperties: false,
    required: ["artifactId", "sourceFragmentId"],
    properties: {
      artifactId: { type: "string", minLength: 1 },
      sourceFragmentId: { type: "string", enum: ["architecture-v2.3:p4:p2"] },
    },
  },
  impact: {
    type: "object",
    additionalProperties: false,
    required: ["impactCaseId"],
    properties: {
      impactCaseId: { type: "string", enum: ["sbom-2.3-2.4"] },
    },
  },
  incident: {
    type: "object",
    additionalProperties: false,
    required: ["incidentId"],
    properties: {
      incidentId: { type: "string", enum: ["incident-aegis-001"] },
    },
  },
  approve: {
    type: "object",
    additionalProperties: false,
    required: ["suggestionId"],
    properties: {
      suggestionId: { type: "string", minLength: 1 },
    },
  },
} as const satisfies Record<string, ObjectSchema>;

export function validateInput<T extends Record<string, string>>(
  schema: ObjectSchema,
  input: unknown,
): { ok: true; data: T } | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "A JSON object is required." };
  }
  const record = input as Record<string, unknown>;
  if (Object.keys(record).some((key) => !(key in schema.properties))) {
    return { ok: false, error: "Unknown input fields are not allowed." };
  }
  for (const key of schema.required) {
    const value = record[key];
    const rule = schema.properties[key];
    if (typeof value !== "string" || (rule.minLength && value.length < rule.minLength)) {
      return { ok: false, error: `${key} is required.` };
    }
    if (rule.enum && !rule.enum.includes(value)) {
      return { ok: false, error: `Unknown ${key}.` };
    }
  }
  return { ok: true, data: record as T };
}
