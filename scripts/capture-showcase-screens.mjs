import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, "../public/images/showcase");

async function captureScreens() {
  console.log("Launching Chromium for showcase screenshots...");
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2, // Retina 2x 高清
  });

  const page = await context.newPage();

  // 1. 首页 Hero 区域截图
  console.log("Capturing Hero Overview...");
  await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(outputDir, "1-hero-ambient.png"),
    clip: { x: 0, y: 0, width: 1440, height: 860 },
  });

  // 2. 知识图谱展台截图
  console.log("Capturing Knowledge Graph Section...");
  const graphSection = page.locator("#knowledge-graph");
  if (await graphSection.count() > 0) {
    await graphSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await graphSection.screenshot({
      path: path.join(outputDir, "2-knowledge-graph.png"),
    });
  }

  // 3. 3D 实机神经因果沙盒截图
  console.log("Capturing 3D Simulator Section...");
  const simSection = page.locator("#interactive-playground");
  if (await simSection.count() > 0) {
    await simSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await simSection.screenshot({
      path: path.join(outputDir, "3-interactive-simulator.png"),
    });
  }

  // 4. 科研学术专栏与论文长文阅读截图
  console.log("Capturing Research Publications & Knowledge Base...");
  await page.goto("http://localhost:3200/research", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(outputDir, "4-research-publication-view.png"),
    clip: { x: 0, y: 0, width: 1440, height: 960 },
  });

  // 5. 开发者文档中心截图
  console.log("Capturing Developer Documentation Center...");
  await page.goto("http://localhost:3200/docs", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(outputDir, "5-developer-documentation.png"),
    clip: { x: 0, y: 0, width: 1440, height: 960 },
  });

  await browser.close();
  console.log("All showcase screenshots successfully saved to public/images/showcase/");
}

captureScreens().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
