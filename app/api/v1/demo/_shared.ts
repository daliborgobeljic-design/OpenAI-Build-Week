import { env } from "cloudflare:workers";
import { runStructured } from "@/packages/ai/responses.mjs";
import {
  containsSensitiveMetadata,
  DEMO_CASES,
  DEMO_SOURCE_FRAGMENT_ID,
  isSameOrigin,
  validateDemoInput,
} from "@/packages/demo/security.mjs";
import { impactCases, incidentCases, sourceFragments } from "../ai/_shared";

type DemoUseCase = "evidence" | "impact" | "incident" | "approve";

export function demoResponse(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function parseDemoRequest(request: Request, useCase: DemoUseCase) {
  if (!isSameOrigin(request.url, request.headers.get("origin"))) {
    return { ok: false as const, response: demoResponse({ error: "Same-origin demo request required." }, 403) };
  }
  const parsed = validateDemoInput(useCase, await request.json().catch(() => null));
  if (!parsed.ok) {
    return { ok: false as const, response: demoResponse({ error: parsed.error }, 400) };
  }
  return { ok: true as const, data: parsed.data as Record<string, string> };
}

async function actorHash(request: Request) {
  const source = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  const bytes = new TextEncoder().encode(source);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest).slice(0, 12))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function consumeDemoRateLimit(request: Request, useCase: string) {
  const actorId = await actorHash(request);
  const windowStart = new Date(Math.floor(Date.now() / 600000) * 600000).toISOString();
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS demo_rate_limits (actor_hash text NOT NULL, use_case text NOT NULL, window_start text NOT NULL, calls integer NOT NULL DEFAULT 0, PRIMARY KEY (actor_hash, use_case, window_start))",
  ).run();
  const row = await env.DB.prepare(
    "SELECT calls FROM demo_rate_limits WHERE actor_hash=? AND use_case=? AND window_start=?",
  ).bind(actorId, useCase, windowStart).first<{ calls: number }>();
  if ((row?.calls || 0) >= 6) return false;
  await env.DB.prepare(
    "INSERT INTO demo_rate_limits (actor_hash,use_case,window_start,calls) VALUES (?,?,?,1) ON CONFLICT(actor_hash,use_case,window_start) DO UPDATE SET calls=calls+1",
  ).bind(actorId, useCase, windowStart).run();
  return true;
}

export async function callDemoModel(
  request: Request,
  useCase: "evidence" | "impact" | "incident",
  input: unknown,
) {
  if (!(await consumeDemoRateLimit(request, useCase))) {
    return { ok: false as const, response: demoResponse({ error: "Demo rate limit reached. Try again later." }, 429) };
  }
  if (!process.env.OPENAI_API_KEY) {
    return { ok: false as const, response: demoResponse({ error: "Live GPT-5.6 is not configured server-side." }, 503) };
  }
  try {
    const result = await runStructured({
      useCase,
      input,
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-5.6-sol",
      reasoningEffort: process.env.OPENAI_REASONING_EFFORT || "medium",
    });
    if (containsSensitiveMetadata(result)) {
      return { ok: false as const, response: demoResponse({ error: "Unsafe model metadata was rejected." }, 500) };
    }
    return { ok: true as const, result };
  } catch {
    return { ok: false as const, response: demoResponse({ error: "The live GPT-5.6 demo request could not be completed." }, 502) };
  }
}

export {
  DEMO_CASES,
  DEMO_SOURCE_FRAGMENT_ID,
  impactCases,
  incidentCases,
  sourceFragments,
};
