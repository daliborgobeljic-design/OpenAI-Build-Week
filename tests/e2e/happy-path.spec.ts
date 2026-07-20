import { test, expect } from "@playwright/test";

const model = "gpt-5.6-sol";

test("public synthetic judge UI contract from cited evidence to dossier", async ({ page }) => {
  await page.route("**/demo-source/aegisedge-architecture-v2.3.pdf*", (route) => route.fulfill({
    status: 200,
    contentType: "application/pdf",
    body: Buffer.from("%PDF-1.4\n%%EOF"),
  }));
  await page.route("**/api/v1/demo/evidence", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    headers: { "Cache-Control": "no-store" },
    body: JSON.stringify({
      responseId: "resp_mock_e2e_evidence",
      model,
      status: "SUGGESTED",
      suggestionId: "demo:resp_mock_e2e_evidence",
      demo: { caseId: "aegisedge-architecture-v2.3", persistence: "NON_PERSISTENT" },
      output: {
        targetField: "Secure administrative communications",
        proposedValue: "Administrative traffic uses mutual TLS 1.3.",
        sourceFragmentId: "architecture-v2.3:p4:p2",
        confidence: 0.94,
        warnings: [],
      },
    }),
  }));
  await page.route("**/api/v1/demo/approve", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    headers: { "Cache-Control": "no-store" },
    body: JSON.stringify({
      suggestionId: "demo:resp_mock_e2e_evidence",
      status: "APPROVED",
      demo: { persistence: "NON_PERSISTENT" },
    }),
  }));
  await page.route("**/api/v1/demo/impact", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    headers: { "Cache-Control": "no-store" },
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
  await page.route("**/api/v1/demo/incident", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    headers: { "Cache-Control": "no-store" },
    body: JSON.stringify({
      responseId: "resp_mock_e2e_incident",
      model,
      status: "SUGGESTED",
      output: {
        fields: {
          product: "AegisEdge Gateway 2.3",
          awarenessTime: "2026-07-19 08:15 UTC",
          incidentSummary: "Authentication bypass under investigation",
          exploitationObserved: null,
        },
        missingInformation: ["Whether exploitation was observed"],
        citations: ["fact-product", "fact-exploitation"],
      },
    }),
  }));

  await page.goto("/");
  await expect(page.getByText("PUBLIC SYNTHETIC JUDGE DEMO")).toBeVisible();
  await expect(page.getByText("No GPT result is being simulated.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Open cited PDF/ })).toHaveAttribute(
    "href",
    "/demo-source/aegisedge-architecture-v2.3.pdf#page=4",
  );

  const loadEvidence = page.getByRole("button", { name: "Load synthetic evidence" });
  await expect(loadEvidence).toBeEnabled();
  await loadEvidence.click();
  await expect(page.getByText(/Loaded guided synthetic case/)).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Extract with GPT-5.6" }).click();
  await expect(page.getByText("Schema-valid live response received. Human review is still required.")).toBeVisible();
  await expect(page.getByText("resp_mock_e2e_evidence")).toBeVisible();
  await expect(page.getByText("SUGGESTED", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Approve claim" }).click();
  await expect(page.getByText("APPROVED IN DEMO SESSION", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Evidence graph/ }).click();
  await expect(page.getByText("Approved in this non-persistent judge session")).toBeVisible();

  await page.getByRole("button", { name: /SBOM impact/ }).click();
  await expect(page.locator(".cards .stale")).toHaveCount(2);
  await page.getByRole("button", { name: "Explain deterministic impact with GPT-5.6" }).click();
  await expect(page.getByText("Review the two code-selected stale claims first.")).toBeVisible();

  await page.getByRole("button", { name: /Incident draft/ }).click();
  await expect(page.getByText(/Unknown.*confirmation required/)).toBeVisible();
  await page.getByRole("button", { name: "Draft worksheet with GPT-5.6" }).click();
  await expect(page.getByText("SUGGESTED, not submitted", { exact: false })).toBeVisible();

  await page.getByRole("button", { name: /Dossier/ }).click();
  await expect(page.getByRole("link", { name: "Download PDF" })).toHaveAttribute("href", "/demo-export/technical-dossier.pdf");
  await expect(page.getByRole("link", { name: "Download ZIP package" })).toHaveAttribute("href", "/demo-export/aegisedge-annex-vii-draft.zip");
});
