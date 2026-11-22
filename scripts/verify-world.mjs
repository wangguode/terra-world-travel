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
  const readyStatus = page.getByRole("status").filter({ hasText: "云海浮空仙刹" });
  await expect(readyStatus).toBeVisible({ timeout: 15000 });
  result.checks.sanctuaryReady = true;

  const snap = async (name, wait = 900) => {
    await page.waitForTimeout(wait);
    const file = path.join(output, name);
    await page.screenshot({ path: file });
    result.screenshots.push(file);
  };

  // 1. 首屏迎面飞向金顶古塔与第1道灵气环
  await snap("sanctuary-hero-1440.png", 900);

  // 2. 加速 + 左转侧倾飞行视角
  await page.keyboard.down("Shift");
  await page.keyboard.down("a");
  await page.waitForTimeout(900);
  await snap("sanctuary-flight-1440.png", 200);
  await page.keyboard.up("a");
  await page.keyboard.up("Shift");
  result.checks.flightControls = true;

  // 3. 电影巡航全景视角
  await page.getByRole("button", { name: "电影巡航", exact: true }).click();
  await snap("sanctuary-cinematic-1440.png", 1400);
  result.checks.cinematicCruise = true;

  // 4. 移动端 375px 适配验证
  await page.setViewportSize({ width: 375, height: 812 });
  await snap("sanctuary-mobile-375.png", 800);
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
