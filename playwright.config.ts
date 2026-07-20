import { defineConfig, devices } from "@playwright/test";
const baseURL=process.env.E2E_BASE_URL||"http://127.0.0.1:3000";
const executablePath=process.env.PLAYWRIGHT_EXECUTABLE_PATH;
const sitesBypass=process.env.E2E_SITES_BYPASS_TOKEN;const liveSmoke=process.env.E2E_LIVE_SMOKE_TOKEN;
const testHeaders={"x-cra-demo-user":"aegis-labs-judge",...(sitesBypass?{"OAI-Sites-Authorization":`Bearer ${sitesBypass}`}:{}) ,...(liveSmoke?{"x-cra-live-smoke-token":liveSmoke}:{})};
export default defineConfig({testDir:"./tests/e2e",timeout:30_000,use:{baseURL,trace:"retain-on-failure",launchOptions:executablePath?{executablePath}:{},extraHTTPHeaders:testHeaders},webServer:process.env.E2E_BASE_URL?undefined:{command:"pnpm dev",url:baseURL,reuseExistingServer:true,timeout:120_000},projects:[{name:"chromium",use:{...devices["Desktop Chrome"]}}]});
