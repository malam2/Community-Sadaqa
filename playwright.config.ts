import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 30000,

  use: {
    baseURL: "http://localhost:8081",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: [
    {
      command: "npm run docker:db && npm run db:push",
      timeout: 30000,
      reuseExistingServer: true,
    },
    {
      command: "npm run server:dev",
      url: "http://localhost:3001",
      timeout: 30000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        "EXPO_NO_DEPENDENCY_VALIDATION=1 EXPO_PUBLIC_DOMAIN=localhost:3001 npx expo start --web --port 8081",
      url: "http://localhost:8081",
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
