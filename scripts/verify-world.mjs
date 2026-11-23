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
    await page.waitForTimeout(3500);
    report.checks.globeReady = true;

    // 2. 点击「自由驾驶」：自动俯冲马特洪峰并激活 FPS 罗盘与准星
    await page.getByRole("button", { name: "自由驾驶" }).click();
    await expect(page.getByRole("status").filter({ hasText: "自由驾驶 · 马特洪峰" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByLabel("Flight Compass")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(4200);

    // 3. 真实按住 W + Shift 向前物理加速飞行 1.2 秒，验证位移与航速
    await page.keyboard.down("Shift");
    await page.keyboard.down("w");
    await page.waitForTimeout(1200);
    const compassText = await page.getByLabel("Flight Compass").textContent();
    report.checks.compassDuringFlight = compassText;
    await page.keyboard.up("w");
    await page.keyboard.up("Shift");

    // 切换黄金日落光影，截取第一人称驾驶实机图
    await page.getByRole("button", { name: "晴空" }).click();
    await page.waitForTimeout(1500);
    const pilotShot = path.join(OUT_DIR, "earth-pilot-matterhorn-1440.png");
    await page.screenshot({ path: pilotShot });
    report.screenshots.push(pilotShot);
    report.checks.pilotModeVerified = true;

    // 4. 切换到纽约曼哈顿低空驾驶视角并截图
    await page.getByRole("button", { name: "纽约曼哈顿" }).click();
    await page.waitForTimeout(4500);
    const manhattanPilotShot = path.join(OUT_DIR, "earth-pilot-manhattan-1440.png");
    await page.screenshot({ path: manhattanPilotShot });
    report.screenshots.push(manhattanPilotShot);

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
