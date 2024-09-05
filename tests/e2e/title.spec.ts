import { test, expect } from "@playwright/test";

test("title should be Kiln", async ({ page }) => {
  await page.goto("/");
  const title = await page.title();
  expect(title).toBe("Kiln");
});
