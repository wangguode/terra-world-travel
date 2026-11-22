import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const output = path.resolve("screenshots/world-verification");
await fs.mkdir(output, { recursive: true });
const result = { url: process.env.WORLD_URL || "http://127.0.0.1:3100", checks: {}, errors: [], warnings: [], screenshots: [] };
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on("console", (msg) => {
    if (msg.type() === "error") result.errors.push(msg.text());
    if (msg.type() === "warning") result.warnings.push(msg.text());
  });
  page.on("pageerror", (err) => result.errors.push(err.message));

  await page.goto(result.url, { waitUntil: "domcontentloaded", timeout: 30000 });
  const valleyReady = page.getByRole("status").filter({ hasText: "阿尔卑斯雪山溪谷" });
  await expect(valleyReady).toBeVisible({ timeout: 25000 });
  result.checks.valleyReady = true;

  const snap = async (name, wait = 1800) => {
    await page.waitForTimeout(wait);
    const file = path.join(output, name);
    await page.screenshot({ path: file });
    result.screenshots.push(file);
  };

  await snap("3dgs-valley-1440.png", 2000);

  // 切换到实景铁路 3DGS
  await page.getByRole("button", { name: "实景铁路", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "真实铁路机车与轨道" })).toBeVisible({ timeout: 25000 });
  result.checks.transitReady = true;
  await snap("3dgs-transit-1440.png", 2200);

  // 切回雪山溪谷并验证移动端 375px
  await page.getByRole("button", { name: "雪山溪谷", exact: true }).click();
  await page.setViewportSize({ width: 375, height: 812 });
  await snap("3dgs-mobile-375.png", 1000);
  result.checks.mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  if (result.checks.mobileOverflow) throw new Error("Mobile page overflows horizontally");
  if (result.errors.length) throw new Error(`Browser errors: ${result.errors.join("; ")}`);
  result.passed = true;
} catch (error) {
  result.passed = false;
  result.failure = String(error.stack || error);
  process.exitCode = 1;
} finally {
  await fs.writeFile(path.join(output, "results.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}
