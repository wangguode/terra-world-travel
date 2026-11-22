import * as THREE from "three";

/**
 * 简单确定性 2D 哈希噪声，用于程序化岩石、瓦片、云朵与瀑布贴图生成
 */
function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm2(x: number, y: number, octaves = 4): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise(x * freq, y * freq);
    freq *= 2.02;
    amp *= 0.5;
  }
  return val;
}

/**
 * 生成青黛山崖岩石漫反射贴图（带石纹与苔藓层次）
 */
export function createCliffTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm2(x * 0.045, y * 0.065, 4);
      const strata = Math.sin(y * 0.16 + n * 5.0) * 0.5 + 0.5;
      const moss = fbm2(x * 0.08 + 13, y * 0.08 + 7, 3);
      const r = Math.round(42 + n * 38 + strata * 16 - moss * 12);
      const g = Math.round(52 + n * 44 + strata * 14 + moss * 18);
      const b = Math.round(64 + n * 42 + strata * 18);
      const idx = (y * size + x) * 4;
      img.data[idx] = Math.max(0, Math.min(255, r));
      img.data[idx + 1] = Math.max(0, Math.min(255, g));
      img.data[idx + 2] = Math.max(0, Math.min(255, b));
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 生成柔和多层体积感白云贴图（用于翻涌云海粒子）
 */
export function createCloudSpriteTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, size, size);
  const puffs: [number, number, number, number][] = [
    [128, 132, 92, 0.42],
    [88, 140, 68, 0.34],
    [168, 142, 72, 0.34],
    [128, 102, 74, 0.32],
    [104, 114, 58, 0.28],
    [154, 116, 60, 0.28],
  ];
  for (const [cx, cy, r, alpha] of puffs) {
    const grad = ctx.createRadialGradient(cx, cy, r * 0.08, cx, cy, r);
    grad.addColorStop(0, `rgba(255, 245, 232, ${alpha})`);
    grad.addColorStop(0.55, `rgba(218, 226, 244, ${alpha * 0.6})`);
    grad.addColorStop(1, "rgba(180, 198, 230, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 生成流动瀑布水幕贴图（支持 UV.y 滚动实现飞流直下）
 */
export function createWaterfallTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, "rgba(140, 220, 255, 0.0)");
  grad.addColorStop(0.18, "rgba(195, 240, 255, 0.55)");
  grad.addColorStop(0.5, "rgba(255, 255, 255, 0.92)");
  grad.addColorStop(0.82, "rgba(195, 240, 255, 0.55)");
  grad.addColorStop(1, "rgba(140, 220, 255, 0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 叠加纵向水流泡沫条纹
  for (let i = 0; i < 42; i++) {
    const x = 14 + (i * 19) % (w - 28);
    const y = (i * 37) % h;
    const len = 34 + (i % 5) * 18;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.28 + (i % 4) * 0.14})`;
    ctx.fillRect(x, y, 2.5 + (i % 3), len);
    if (y + len > h) {
      ctx.fillRect(x, 0, 2.5 + (i % 3), y + len - h);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 2.5);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 生成径向柔光粒子贴图（萤火、银杏灵光、尾焰）
 */
export function createGlowSpriteTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(0.3, "rgba(255, 232, 165, 0.85)");
  grad.addColorStop(0.7, "rgba(120, 210, 255, 0.25)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
