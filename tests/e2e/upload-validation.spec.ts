import { test, expect } from "@playwright/test";

test("upload rejects a spoofed PDF before persistence", async ({ request }) => {
  const response = await request.post("/api/v1/artifacts", {
    multipart: {
      file: { name: "spoof.pdf", mimeType: "application/pdf", buffer: Buffer.from("not a pdf") },
    },
  });
  expect(response.status()).toBe(415);
  await expect(response.json()).resolves.toMatchObject({ error: expect.stringMatching(/signature/i) });
});
