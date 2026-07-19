import { test, expect } from "@playwright/test";
test("grounded review to stale impact, incident and dossier downloads",async({page})=>{
 await page.goto("/"); await expect(page.getByRole("heading",{name:/AegisEdge Gateway/})).toBeVisible(); await page.waitForTimeout(2000);
 await page.getByRole("button",{name:"Approve claim"}).click(); await expect(page.getByText("APPROVED")).toBeVisible();
 await page.getByRole("button",{name:/Evidence graph/}).click(); await expect(page.getByText("Approved by M. Chen")).toBeVisible();
 await page.getByRole("button",{name:/SBOM impact/}).click(); await expect(page.getByText("One component changed. Two claims need attention.")).toBeVisible(); await expect(page.getByText("STALE")).toHaveCount(2);
 await page.getByRole("button",{name:/Incident draft/}).click(); await expect(page.getByText("Unknown · confirmation required")).toBeVisible();
 await page.getByRole("button",{name:/Dossier/}).click(); await expect(page.getByRole("link",{name:"Download PDF"})).toHaveAttribute("href","/demo-export/technical-dossier.pdf"); await expect(page.getByRole("link",{name:"Download ZIP package"})).toHaveAttribute("href","/demo-export/aegisedge-annex-vii-draft.zip");
});
