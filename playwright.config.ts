import { defineConfig, devices } from "@playwright/test";
const baseURL=process.env.E2E_BASE_URL||"http://127.0.0.1:3000";
export default defineConfig({testDir:"./tests/e2e",timeout:30_000,use:{baseURL,trace:"retain-on-failure",extraHTTPHeaders:{"x-cra-demo-user":"aegis-labs-judge"}},webServer:process.env.E2E_BASE_URL?undefined:{command:"pnpm dev",url:baseURL,reuseExistingServer:true,timeout:120_000},projects:[{name:"chromium",use:{...devices["Desktop Chrome"]}}]});
