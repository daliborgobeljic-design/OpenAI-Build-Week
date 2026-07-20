import { test, expect } from "@playwright/test";

test("upload rejects a spoofed PDF before persistence", async ({ request }) => {
  const response = await request.post("/api/v1/artifacts", {
    multipart: {
      file: { name: "spoof.pdf", mimeType: "application/pdf", buffer: Buffer.from("not a pdf") },
    },
  });
  if (process.env.E2E_BASE_URL?.startsWith("https://")) {
    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringMatching(/authentication/i) });
  } else {
    expect(response.status()).toBe(415);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringMatching(/signature/i) });
  }
});
