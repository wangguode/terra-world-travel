import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const output = path.resolve("screenshots/world-verification");
await fs.mkdir(output, { recursive: true });
const result = { url: process.env.WORLD_URL || "http://127.0.0.1:3100", checks: {}, errors: [], warnings: [], requests: [], screenshots: [] };
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on("console", (message) => {
    if (message.type() === "error") result.errors.push(message.text());
    if (message.type() === "warning") result.warnings.push(message.text());
  });
  page.on("pageerror", (error) => result.errors.push(error.message));
  page.on("request", (request) => {
    if (/\/(models|draco|textures)\//.test(request.url())) result.requests.push(request.url());
  });
  await page.addInitScript(() => {
    window.__worldContextCalls = 0;
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (kind === "webgl2" || kind === "webgl") window.__worldContextCalls++;
      return original.call(this, kind, ...args);
    };
  });
  await page.goto(result.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  const templeReady = page.getByRole("status").filter({ hasText: "焦山定慧寺塔院扫描" });
  await expect(templeReady).toBeVisible({ timeout: 90000 });
  result.checks.templeReady = true;
  await page.evaluate(() => { window.__worldCanvas = document.querySelector("canvas"); });
  const screenshot = async (name) => {
    await page.waitForTimeout(1500);
    const file = path.join(output, name);
    await page.screenshot({ path: file });
    result.screenshots.push(file);
  };
  await screenshot("temple-desktop-1440.png");
  const zHud = page.locator("span").filter({ hasText: /^Z: -?[\d.]+m$/ }).first();
  const beforeZ = await zHud.innerText();
  const beforeRequests = result.requests.length;
  const beforeContexts = await page.evaluate(() => window.__worldContextCalls);
  const beforeWarnings = result.warnings.length;
  await page.keyboard.down("w");
  await page.waitForTimeout(1100);
  await page.keyboard.up("w");
  await expect(zHud).not.toHaveText(beforeZ, { timeout: 6000 });
  result.checks.movement = { before: beforeZ, after: await zHud.innerText() };
  await expect.poll(() => page.evaluate(() => document.querySelector("canvas") === window.__worldCanvas)).toBe(true);
  result.checks.stableCanvas = true;
  if (await page.evaluate(() => window.__worldContextCalls) !== beforeContexts) throw new Error("Movement initialized a new WebGL context");
  if (result.requests.length !== beforeRequests) throw new Error("Movement reloaded model assets");
  if (result.warnings.slice(beforeWarnings).some((warning) => /context|initializ|WebGL/i.test(warning))) throw new Error("Movement produced WebGL warnings");
  result.checks.noReloadOnMovement = true;
  const meritPanel = page.getByText("赛博禅修 · 功德积攒", { exact: true }).first().locator("..");
  const beforeMerit = Number((await meritPanel.innerText()).match(/\d+/)?.[0]);
  await page.getByRole("button", { name: "敲木鱼", exact: true }).first().click();
  await expect.poll(async () => Number((await meritPanel.innerText()).match(/\d+/)?.[0])).toBe(beforeMerit + 1);
  result.checks.merit = true;
  await page.waitForTimeout(2200);
  await page.setViewportSize({ width: 375, height: 812 });
  await screenshot("temple-mobile-375.png");
  result.checks.mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "写实街区", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Amazon Lumberyard Bistro" })).toBeVisible({ timeout: 120000 });
  result.checks.cityReady = true;
  await screenshot("city-desktop-1440.png");
  const loadedRequests = result.requests.length;
  await page.getByRole("button", { name: "灵山寺院", exact: true }).click();
  await expect(templeReady).toBeVisible();
  await page.waitForTimeout(500);
  if (result.requests.length !== loadedRequests) throw new Error("Returning to temple reloaded assets");
  result.checks.cachedModeSwitch = true;
  for (const name of ["全寺总览", "山门", "大雄宝殿", "如来巨佛"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await page.waitForTimeout(200);
  }
  result.checks.templeNavigation = true;
  await screenshot("buddha-desktop-1440.png");
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
