import { test, expect } from "@playwright/test";

const model = "gpt-5.6-sol";

test("grounded review to stale impact, incident and dossier downloads", async ({ page }) => {
  await page.route("**/api/v1/artifacts", (route) => route.fulfill({
    status: 201,
    contentType: "application/json",
    body: JSON.stringify({
      artifact: { id: "artifact-mock-e2e", name: "architecture-v2.3.pdf", sha256: "0123456789abcdef", bytes: 1024, status: "STORED" },
    }),
  }));
  await page.route("**/api/v1/ai/evidence", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      responseId: "resp_mock_e2e_evidence",
      model,
      status: "SUGGESTED",
      suggestionId: "suggestion-mock-e2e",
      output: {
        targetField: "Secure administrative communications",
        proposedValue: "Administrative traffic uses mutual TLS 1.3.",
        sourceFragmentId: "architecture-v2.3:p4:p2",
        confidence: 0.94,
        warnings: [],
      },
    }),
  }));
  await page.route("**/api/v1/ai/approve", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ suggestionId: "suggestion-mock-e2e", status: "APPROVED" }),
  }));
  await page.route("**/api/v1/ai/impact", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      responseId: "resp_mock_e2e_impact",
      model,
      status: "SUGGESTED",
      output: {
        explanation: "Review the two code-selected stale claims first.",
        reviewPriorities: ["Verify TLS runtime evidence", "Refresh the component snapshot"],
        citedNodeIds: ["claim-secure-admin", "claim-crypto-update"],
      },
    }),
  }));
  await page.route("**/api/v1/ai/incident", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      responseId: "resp_mock_e2e_incident",
      model,
      status: "SUGGESTED",
      output: {
        fields: { product: "AegisEdge Gateway 2.3", awarenessTime: "2026-07-19 08:15 UTC", incidentSummary: "Authentication bypass under investigation", exploitationObserved: null },
        missingInformation: ["Whether exploitation was observed"],
        citations: ["fact-product", "fact-exploitation"],
      },
    }),
  }));

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /AegisEdge Gateway/ })).toBeVisible();
  await expect(page.getByText("No GPT result is being simulated.")).toBeVisible();

  await page.getByRole("button", { name: "Load synthetic document" }).click();
  await expect(page.getByText(/Stored · SHA-256/)).toBeVisible();
  await page.getByRole("button", { name: "Extract with GPT-5.6" }).click();
  await expect(page.getByText("Schema-valid live response received. Human review is still required.")).toBeVisible();
  await expect(page.getByText("resp_mock_e2e_evidence")).toBeVisible();
  await expect(page.getByText("SUGGESTED", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Approve claim" }).click();
  await expect(page.getByText("APPROVED", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Evidence graph/ }).click();
  await expect(page.getByText("Approved by authenticated reviewer")).toBeVisible();

  await page.getByRole("button", { name: /SBOM impact/ }).click();
  await expect(page.getByText("One component changed. Two claims need attention.")).toBeVisible();
  await expect(page.getByText("STALE", { exact: true })).toHaveCount(2);
  await page.getByRole("button", { name: "Explain deterministic impact with GPT-5.6" }).click();
  await expect(page.getByText("Review the two code-selected stale claims first.")).toBeVisible();

  await page.getByRole("button", { name: /Incident draft/ }).click();
  await expect(page.getByText("Unknown · confirmation required")).toBeVisible();
  await page.getByRole("button", { name: "Draft worksheet with GPT-5.6" }).click();
  await expect(page.getByText("SUGGESTED, not submitted")).toBeVisible();

  await page.getByRole("button", { name: /Dossier/ }).click();
  await expect(page.getByRole("link", { name: "Download PDF" })).toHaveAttribute("href", "/demo-export/technical-dossier.pdf");
  await expect(page.getByRole("link", { name: "Download ZIP package" })).toHaveAttribute("href", "/demo-export/aegisedge-annex-vii-draft.zip");
});
