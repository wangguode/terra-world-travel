import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "public", "images");
fs.mkdirSync(outDir, { recursive: true });

const scenes = [
  {
    file: "seoul-gyeongbokgung.svg",
    title: "GYEONGBOKGUNG // GWANGHWAMUN AXIS",
    coords: "37.5796° N, 126.9770° E · ALT 42M",
    bg1: "#121820",
    bg2: "#1f2d3d",
    accent: "#ff5a26",
    horizon: "#d9825b",
    archType: "palace-kr",
    caption: "Seoul Royal Axis · Bukhansan Ridge Backdrop",
  },
  {
    file: "seoul-seongsu.svg",
    title: "SEONGSU-DONG // ATELIER DISTRICT",
    coords: "37.5446° N, 127.0560° E · ALT 18M",
    bg1: "#1a1715",
    bg2: "#2d2520",
    accent: "#ff5a26",
    horizon: "#e4a872",
    archType: "industrial",
    caption: "Red-Brick Warehouse Roasteries & Flagship Concepts",
  },
  {
    file: "seoul-incheon-arex.svg",
    title: "INCHEON T1/T2 // AREX EXPRESS CORRIDOR",
    coords: "37.4602° N, 126.4407° E · 43 MIN TO SEOUL STN",
    bg1: "#0d151c",
    bg2: "#182836",
    accent: "#38bdf8",
    horizon: "#7dd3fc",
    archType: "transit",
    caption: "B1F All-Stop vs Non-Stop Orange Express Gate",
  },
  {
    file: "beijing-forbidden-city.svg",
    title: "FORBIDDEN CITY // HALL OF SUPREME HARMONY",
    coords: "39.9163° N, 116.3972° E · CENTRAL MERIDIAN",
    bg1: "#1f1210",
    bg2: "#3b1d16",
    accent: "#f59e0b",
    horizon: "#fbbf24",
    archType: "palace-cn",
    caption: "7.8km UNESCO Central Axis · Jingshan Overlook",
  },
  {
    file: "beijing-summer-palace.svg",
    title: "SUMMER PALACE // KUNMING LAKE & LONGEVITY HILL",
    coords: "39.9999° N, 116.2755° E · SEVENTEEN-ARCH BRIDGE",
    bg1: "#101c1a",
    bg2: "#1c332f",
    accent: "#34d399",
    horizon: "#6ee7b7",
    archType: "lake",
    caption: "Imperial Garden Golden Hour · West Causeway",
  },
  {
    file: "beijing-shichahai.svg",
    title: "SHICHAHAI // DRUM TOWER & HUTONG COURTYARDS",
    coords: "39.9405° N, 116.3887° E · YANDAI XIEJIE",
    bg1: "#16181c",
    bg2: "#262a32",
    accent: "#ff5a26",
    horizon: "#f97316",
    archType: "hutong",
    caption: "Gray-Tile Siheyuan Alleys & Bell-Drum Axis",
  },
];

for (const s of scenes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" width="1200" height="720">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${s.bg1}"/>
      <stop offset="68%" stop-color="${s.bg2}"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="54%" r="48%">
      <stop offset="0%" stop-color="${s.horizon}" stop-opacity="0.38"/>
      <stop offset="60%" stop-color="${s.accent}" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="${s.bg1}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="720" fill="url(#sky)"/>
  <rect width="1200" height="720" fill="url(#glow)"/>
  <rect width="1200" height="720" fill="url(#grid)"/>

  <!-- Mountain / Skyline Silhouette -->
  <path d="M0 470 L180 390 L340 430 L520 330 L690 400 L880 345 L1060 410 L1200 375 L1200 720 L0 720 Z" fill="#0d1117" fill-opacity="0.65"/>

  <!-- Architectural Wireframe & Volumetric Splat Points -->
  <g stroke="${s.horizon}" stroke-opacity="0.55" fill="none" stroke-width="1.5">
    <path d="M260 480 L940 480"/>
    <path d="M320 480 L380 380 L820 380 L880 480"/>
    <path d="M410 380 L460 300 L740 300 L790 380"/>
    <rect x="440" y="380" width="320" height="100" fill="#0a0a0a" fill-opacity="0.55"/>
    <line x1="520" y1="380" x2="520" y2="480"/>
    <line x1="600" y1="300" x2="600" y2="480"/>
    <line x1="680" y1="380" x2="680" y2="480"/>
  </g>

  <!-- Perspective Ground Grid -->
  <g stroke="#ffffff" stroke-opacity="0.12" stroke-width="1">
    <line x1="0" y1="480" x2="1200" y2="480"/>
    <line x1="0" y1="530" x2="1200" y2="530"/>
    <line x1="0" y1="595" x2="1200" y2="595"/>
    <line x1="600" y1="480" x2="100" y2="720"/>
    <line x1="600" y1="480" x2="350" y2="720"/>
    <line x1="600" y1="480" x2="600" y2="720"/>
    <line x1="600" y1="480" x2="850" y2="720"/>
    <line x1="600" y1="480" x2="1100" y2="720"/>
  </g>

  <!-- Gaussian Splat Anchor Points -->
  <g fill="${s.accent}">
    <circle cx="460" cy="340" r="5" fill-opacity="0.9"/>
    <circle cx="460" cy="340" r="16" fill="none" stroke="${s.accent}" stroke-opacity="0.45" stroke-width="1.5"/>
    <circle cx="600" cy="310" r="6" fill-opacity="0.95"/>
    <circle cx="600" cy="310" r="20" fill="none" stroke="${s.accent}" stroke-opacity="0.5" stroke-width="1.5"/>
    <circle cx="750" cy="360" r="5" fill-opacity="0.9"/>
    <circle cx="750" cy="360" r="16" fill="none" stroke="${s.accent}" stroke-opacity="0.45" stroke-width="1.5"/>
  </g>

  <!-- HUD Telemetry Overlay -->
  <g font-family="ui-monospace, SFMono-Regular, Menlo, monospace" fill="#f5f5f3">
    <text x="56" y="64" font-size="15" letter-spacing="3" fill-opacity="0.7">${s.coords}</text>
    <text x="56" y="102" font-size="26" font-weight="700" letter-spacing="1.5">${s.title}</text>
    <text x="56" y="656" font-size="16" fill-opacity="0.75">${s.caption}</text>
    <text x="1144" y="64" font-size="14" letter-spacing="2" text-anchor="end" fill="${s.accent}">3D GAUSSIAN SPLAT // LIVE RIG</text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(outDir, s.file), svg, "utf8");
}

console.log(`Generated ${scenes.length} scenic assets in ${outDir}`);
