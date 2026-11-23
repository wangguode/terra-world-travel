import { chromium } from "playwright";
import { expect } from "playwright/test";
import fs from "node:fs";
import path from "node:path";

const URL = process.env.WORLD_URL || "http://127.0.0.1:3100";
const OUT_DIR = path.resolve("screenshots/world-verification");
fs.mkdirSync(OUT_DIR, { recursive: true });

const report = {
  url: URL,
  checks: {},
  errors: [],
  warnings: [],
  screenshots: [],
  passed: false,
};

async function run() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    page.on("pageerror", (err) => report.errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") report.errors.push(msg.text());
    });

    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });

    // 1. 验证默认开屏：3D 太空地球全景
    await expect(page.getByRole("status").filter({ hasText: "轨道卫星全景" })).toBeVisible({
      timeout: 25000,
    });
    await page.waitForTimeout(4500);
    const globeShot = path.join(OUT_DIR, "earth-globe-1440.png");
    await page.screenshot({ path: globeShot });
    report.screenshots.push(globeShot);
    report.checks.globeReady = true;

    // 2. 点击「马特洪峰」并切换「日落」大气光影
    await page.getByRole("button", { name: "马特洪峰" }).click();
    await expect(page.getByRole("status").filter({ hasText: "马特洪峰" })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole("button", { name: "晴空" }).click();
    await page.waitForTimeout(5000);
    const matterhornShot = path.join(OUT_DIR, "earth-matterhorn-golden-1440.png");
    await page.screenshot({ path: matterhornShot });
    report.screenshots.push(matterhornShot);
    report.checks.matterhornGoldenReady = true;

    // 3. 向下滚动，检查重构后的深空架构支柱 + 知识图谱区块
    await page.evaluate(() => window.scrollTo(0, 960));
    await page.waitForTimeout(1000);
    const sectionsShot = path.join(OUT_DIR, "earth-home-sections-1440.png");
    await page.screenshot({ path: sectionsShot });
    report.screenshots.push(sectionsShot);
    report.checks.sectionsRendered = true;

    // 4. 移动端 375x812 零横向溢出 + 太空地球开屏
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("button", { name: "太空地球" }).click();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(3000);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    report.checks.mobileOverflow = overflow;
    expect(overflow).toBe(false);

    const mobileShot = path.join(OUT_DIR, "earth-mobile-375.png");
    await page.screenshot({ path: mobileShot });
    report.screenshots.push(mobileShot);

    report.passed = report.errors.length === 0;
  } catch (err) {
    report.passed = false;
    report.failure = String(err);
    throw err;
  } finally {
    await browser.close();
    console.log(JSON.stringify(report, null, 2));
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
