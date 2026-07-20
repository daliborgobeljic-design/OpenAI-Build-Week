import { defineConfig, devices } from "@playwright/test";
const baseURL=process.env.E2E_BASE_URL||"http://127.0.0.1:3000";
const executablePath=process.env.PLAYWRIGHT_EXECUTABLE_PATH;
const sitesBypass=process.env.E2E_SITES_BYPASS_TOKEN;
const testHeaders={"x-cra-demo-user":"aegis-labs-judge",...(sitesBypass?{"OAI-Sites-Authorization":`Bearer ${sitesBypass}`}:{})};
const browserChannel=executablePath?undefined:(process.platform==="win32"?"msedge":undefined);
export default defineConfig({testDir:"./tests/e2e",timeout:30_000,use:{baseURL,trace:"retain-on-failure",launchOptions:executablePath?{executablePath}:{},extraHTTPHeaders:testHeaders},webServer:process.env.E2E_BASE_URL?undefined:{command:"node node_modules/vinext/dist/cli.js build && cd dist/server && node ../../node_modules/wrangler/bin/wrangler.js dev --config wrangler.json --port 3000 --local",url:baseURL,reuseExistingServer:true,timeout:180_000},projects:[{name:"chromium",use:{...devices["Desktop Chrome"],channel:browserChannel}}]});
