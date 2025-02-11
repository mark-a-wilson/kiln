import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://localhost:5173";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [["html", { open: "never" }]],
  webServer: {
    command: "npm run dev", 
    port: 5173,
    timeout: 30000, 
    reuseExistingServer: !process.env.CI, 
  },
  use: {
    baseURL,
    launchOptions: {
      timeout: 30000,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
