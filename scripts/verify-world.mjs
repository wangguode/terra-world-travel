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
  const earthReady = page.getByRole("status").filter({ hasText: "瑞士阿尔卑斯马特洪峰" });
  await expect(earthReady).toBeVisible({ timeout: 25000 });
  result.checks.matterhornReady = true;

  const snap = async (name, wait = 4500) => {
    await page.waitForTimeout(wait);
    const file = path.join(output, name);
    await page.screenshot({ path: file });
    result.screenshots.push(file);
  };

  await snap("earth-matterhorn-1440.png", 5000);

  // 飞往纽约曼哈顿 3D 天际线
  await page.getByRole("button", { name: "纽约曼哈顿", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "纽约曼哈顿" })).toBeVisible({ timeout: 15000 });
  result.checks.manhattanReady = true;
  await snap("earth-manhattan-1440.png", 5500);

  // 飞往日本富士山
  await page.getByRole("button", { name: "日本富士山", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "日本富士山" })).toBeVisible({ timeout: 15000 });
  result.checks.fujiReady = true;
  await snap("earth-fuji-1440.png", 5000);

  // 移动端 375px 适配校验
  await page.setViewportSize({ width: 375, height: 812 });
  await snap("earth-mobile-375.png", 1800);
  result.checks.mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  if (result.checks.mobileOverflow) throw new Error("Mobile page overflows horizontally");
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
