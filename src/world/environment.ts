import * as THREE from "three";
import { fbm2 } from "./textures";

export interface RingCheckpoint {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  passed: boolean;
}

export interface SkySanctuaryWorld {
  group: THREE.Group;
  rings: RingCheckpoint[];
  update: (dt: number, elapsed: number) => void;
}

/**
 * 雕刻单座浮空仙岛：非对称 FBM 峭壁 + 多根副悬岩柱 + 错落崖石与翠坪（彻底告别几何圆锥感）
 */
function createFloatingIsland(
  radius: number,
  depth: number,
  seed: number,
  cliffMat: THREE.Material,
  mossMat: THREE.Material
): THREE.Group {
  const island = new THREE.Group();

  // 主浮空岩体：高分段 + 强烈垂直岩柱褶皱 + 偏心尖底
  const rockGeo = new THREE.CylinderGeometry(radius, radius * 0.08, depth, 36, 16, false);
  const pos = rockGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = (y + depth * 0.5) / depth; // 0 = bottom tip, 1 = top rim
    const ridge = Math.sin(angle * 5 + seed) * 0.16 + Math.cos(angle * 9 - seed * 1.3) * 0.1;
    const n = fbm2(Math.cos(angle) * 2.4 + seed, Math.sin(angle) * 2.4 + normY * 3.2, 4);
    const radialScale = 0.68 + n * 0.62 + ridge;
    // 底部偏心弯曲，模仿张家界/哈利路亚山自然石峰
    const bendX = (1 - normY) * Math.sin(seed) * radius * 0.22;
    const bendZ = (1 - normY) * Math.cos(seed) * radius * 0.22;
    pos.setX(i, x * radialScale + bendX);
    pos.setZ(i, z * radialScale + bendZ);
    if (normY > 0.92) {
      pos.setY(i, y + (n - 0.45) * 3.8);
    }
  }
  rockGeo.computeVertexNormals();
  const rockMesh = new THREE.Mesh(rockGeo, cliffMat);
  rockMesh.position.y = -depth * 0.5;
  rockMesh.castShadow = true;
  rockMesh.receiveShadow = true;
  island.add(rockMesh);

  // 4 根环绕副悬岩/石笋，打破对称锥体剪影
  for (let s = 0; s < 4; s++) {
    const sa = (s / 4) * Math.PI * 2 + seed * 0.7;
    const subR = radius * (0.28 + (s % 2) * 0.14);
    const subD = depth * (0.45 + (s % 3) * 0.18);
    const subGeo = new THREE.ConeGeometry(subR, subD, 9, 4);
    subGeo.rotateX(Math.PI);
    const subMesh = new THREE.Mesh(subGeo, cliffMat);
    subMesh.position.set(
      Math.cos(sa) * radius * 0.58,
      -subD * 0.48 - 1.5,
      Math.sin(sa) * radius * 0.58
    );
    subMesh.rotation.y = sa;
    subMesh.castShadow = true;
    island.add(subMesh);
  }

  // 顶部起伏青翠草丘与崖石边缘
  const capGeo = new THREE.CylinderGeometry(radius * 0.9, radius * 0.98, 2.8, 32, 2);
  const capPos = capGeo.attributes.position;
  for (let i = 0; i < capPos.count; i++) {
    const x = capPos.getX(i);
    const y = capPos.getY(i);
    const z = capPos.getZ(i);
    const angle = Math.atan2(z, x);
    const n = fbm2(Math.cos(angle) * 2.4 + seed, Math.sin(angle) * 2.4 + 3.2, 3);
    const ridge = Math.sin(angle * 5 + seed) * 0.14;
    const radialScale = 0.72 + n * 0.52 + ridge;
    capPos.setX(i, x * radialScale);
    capPos.setZ(i, z * radialScale);
    if (y > 0) {
      capPos.setY(i, y + (n - 0.5) * 2.4);
    }
  }
  capGeo.computeVertexNormals();
  const capMesh = new THREE.Mesh(capGeo, mossMat);
  capMesh.position.y = 0.4;
  capMesh.receiveShadow = true;
  island.add(capMesh);

  return island;
}

/**
 * 构建七层飞檐金顶东方古塔（带暖光窗格与自发光金刹顶）
 */
function createOrientalPagoda(): THREE.Group {
  const pagoda = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xc8c0b4, roughness: 0.85 });
  const redWallMat = new THREE.MeshStandardMaterial({ color: 0x8f241e, roughness: 0.62 });
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x1e4d4b,
    metalness: 0.25,
    roughness: 0.42,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf5c049,
    emissive: 0xffa826,
    emissiveIntensity: 0.65,
    metalness: 0.88,
    roughness: 0.2,
  });
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xffdfa0,
    emissive: 0xffb347,
    emissiveIntensity: 1.85,
  });

  // 三层汉白玉须弥座
  for (let i = 0; i < 3; i++) {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(13 - i * 1.6, 14 - i * 1.6, 2.2, 8),
      stoneMat
    );
    base.position.y = 1.1 + i * 2.1;
    base.receiveShadow = true;
    pagoda.add(base);
  }

  // 七层重檐塔身
  let curY = 7.4;
  for (let tier = 0; tier < 7; tier++) {
    const scale = 1 - tier * 0.085;
    const bodyR = 8.4 * scale;
    const bodyH = 6.2 * (1 - tier * 0.04);

    // 塔身朱红墙体
    const body = new THREE.Mesh(new THREE.CylinderGeometry(bodyR, bodyR * 1.03, bodyH, 8), redWallMat);
    body.position.y = curY + bodyH * 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    pagoda.add(body);

    // 暖光回廊窗格（每层环绕发光带）
    const glowRing = new THREE.Mesh(
      new THREE.CylinderGeometry(bodyR * 1.02, bodyR * 1.02, bodyH * 0.28, 8),
      lanternMat
    );
    glowRing.position.y = curY + bodyH * 0.52;
    pagoda.add(glowRing);

    // 翘角飞檐青瓦顶
    const roofR = bodyR * 1.62;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(roofR, 3.1 * scale, 8), roofMat);
    roof.position.y = curY + bodyH + 1.1 * scale;
    roof.castShadow = true;
    pagoda.add(roof);

    // 飞檐金边装饰环
    const eavesTrim = new THREE.Mesh(
      new THREE.TorusGeometry(roofR * 0.94, 0.16 * scale, 6, 8),
      goldMat
    );
    eavesTrim.rotation.x = Math.PI / 2;
    eavesTrim.rotation.z = Math.PI / 8;
    eavesTrim.position.y = curY + bodyH - 0.1;
    pagoda.add(eavesTrim);

    curY += bodyH + 1.15 * scale;
  }

  // 鎏金宝顶塔刹
  const spire = new THREE.Mesh(new THREE.ConeGeometry(1.1, 11.5, 12), goldMat);
  spire.position.y = curY + 5.8;
  pagoda.add(spire);

  const orb = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 16), goldMat);
  orb.position.y = curY + 1.8;
  pagoda.add(orb);

  // 塔顶暖光点光源
  const towerLight = new THREE.PointLight(0xffb84d, 4.5, 95);
  towerLight.position.set(0, curY - 4, 0);
  pagoda.add(towerLight);

  return pagoda;
}

/**
 * 构建东方古银杏/迎客松风格发光树冠（扁平错落伞状枝叶）
 */
function createGlowingGinkgoTree(scale = 1): THREE.Group {
  const tree = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b2a22, roughness: 0.9 });
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0xffc642,
    emissive: 0xff8c1a,
    emissiveIntensity: 0.35,
    roughness: 0.55,
  });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.36 * scale, 0.78 * scale, 8.5 * scale, 7), trunkMat);
  trunk.position.y = 4.2 * scale;
  trunk.rotation.z = 0.06;
  trunk.castShadow = true;
  tree.add(trunk);

  const layers: [number, number, number, number, number][] = [
    [0, 8.2, 0, 5.2, 1.8],
    [-2.4, 9.6, 1.3, 4.0, 1.5],
    [2.6, 9.1, -1.1, 3.8, 1.4],
    [0.5, 11.4, 0.4, 3.4, 1.4],
    [-1.2, 7.2, -2.0, 3.2, 1.2],
  ];
  for (const [cx, cy, cz, rx, ry] of layers) {
    const crown = new THREE.Mesh(new THREE.ConeGeometry(rx * scale, ry * scale, 9), leafMat);
    crown.position.set(cx * scale, cy * scale, cz * scale);
    crown.castShadow = true;
    tree.add(crown);
  }
  return tree;
}

/**
 * 构建完整《云海浮空仙刹》3D 世界
 */
export function buildSkySanctuaryWorld(
  cliffTex: THREE.Texture,
  cloudTex: THREE.Texture,
  waterfallTex: THREE.Texture,
  glowTex: THREE.Texture
): SkySanctuaryWorld {
  const group = new THREE.Group();

  const cliffMat = new THREE.MeshStandardMaterial({
    map: cliffTex,
    roughness: 0.92,
    metalness: 0.05,
  });
  const mossMat = new THREE.MeshStandardMaterial({
    color: 0x2c5c46,
    roughness: 0.88,
  });

  // 1. 主浮空仙岛 + 七层金顶古塔 + 金色银杏林
  const mainIsland = createFloatingIsland(42, 78, 1.7, cliffMat, mossMat);
  group.add(mainIsland);

  const pagoda = createOrientalPagoda();
  pagoda.position.set(0, 1.2, 0);
  group.add(pagoda);

  const ginkgoSpots: [number, number, number, number][] = [
    [-22, 1.2, 16, 1.35],
    [24, 1.2, 14, 1.15],
    [-18, 1.2, -21, 1.25],
    [21, 1.2, -18, 1.05],
    [6, 1.2, 26, 0.95],
  ];
  for (const [gx, gy, gz, gs] of ginkgoSpots) {
    const tree = createGlowingGinkgoTree(gs);
    tree.position.set(gx, gy, gz);
    tree.rotation.y = gx * 0.4;
    group.add(tree);
  }

  // 2. 主仙岛崖壁双条飞瀑（自然贴合崖壁倾泻入云海，而非细棍悬空）
  const waterfallMat = new THREE.MeshBasicMaterial({
    map: waterfallTex,
    transparent: true,
    opacity: 0.76,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const wfConfigs: [number, number, number, number, number, number][] = [
    [28, -46, 22, 12.5, 96, 0.72],
    [-31, -48, 16, 10.5, 98, -0.92],
  ];
  for (const [wx, wy, wz, ww, wh, rotY] of wfConfigs) {
    const wf = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), waterfallMat);
    wf.position.set(wx, wy, wz);
    wf.rotation.y = rotY;
    group.add(wf);
  }

  // 3. 周围 14 座错落浮空仙山群（《阿凡达》哈利路亚山式纵深构图）
  const islandSpecs: [number, number, number, number, number, boolean][] = [
    [102, 18, -92, 26, 58, true],
    [-112, 26, -78, 28, 64, true],
    [135, -8, 64, 24, 52, true],
    [-130, 6, 82, 25, 56, true],
    [0, 38, -165, 34, 76, true],
    [185, 42, -18, 30, 68, false],
    [-192, 34, -24, 32, 70, false],
    [76, 52, 152, 22, 48, true],
    [-86, -12, 168, 24, 54, false],
    [220, 12, -155, 36, 80, false],
    [-225, 48, -148, 38, 84, false],
    [160, 58, 165, 28, 60, false],
    [-170, 22, 175, 30, 62, false],
    [0, -18, 220, 32, 66, true],
  ];
  const floatingIslands: { mesh: THREE.Group; baseY: number; phase: number }[] = [];
  const vineMat = new THREE.MeshBasicMaterial({
    color: 0x5ef2d6,
    transparent: true,
    opacity: 0.72,
  });

  islandSpecs.forEach(([ix, iy, iz, ir, id, hasTree], idx) => {
    const isl = createFloatingIsland(ir, id, 10 + idx * 3.7, cliffMat, mossMat);
    isl.position.set(ix, iy, iz);
    if (hasTree) {
      const t = createGlowingGinkgoTree(0.95 + (idx % 3) * 0.25);
      t.position.set(0, 1.1, 0);
      isl.add(t);
    }
    // 岛底垂挂 3 条发光灵藤
    for (let v = 0; v < 3; v++) {
      const va = (v / 3) * Math.PI * 2 + idx;
      const vLen = 14 + ((idx + v) % 4) * 6;
      const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.06, vLen, 5), vineMat);
      vine.position.set(Math.cos(va) * ir * 0.65, -vLen * 0.5 - 2, Math.sin(va) * ir * 0.65);
      isl.add(vine);
    }
    group.add(isl);
    floatingIslands.push({ mesh: isl, baseY: iy, phase: idx * 0.9 });
  });

  // 4. 无垠翻涌云海（240 片柔光体积云粒子，环绕岛屿下方）
  const cloudCount = 240;
  const cloudGeo = new THREE.BufferGeometry();
  const cloudPos = new Float32Array(cloudCount * 3);
  for (let i = 0; i < cloudCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 35 + Math.pow(Math.random(), 0.7) * 520;
    cloudPos[i * 3 + 0] = Math.cos(angle) * dist;
    cloudPos[i * 3 + 1] = -82 + Math.random() * 44;
    cloudPos[i * 3 + 2] = Math.sin(angle) * dist;
  }
  cloudGeo.setAttribute("position", new THREE.BufferAttribute(cloudPos, 3));
  const cloudMat = new THREE.PointsMaterial({
    map: cloudTex,
    size: 135,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    color: 0xdce6f7,
  });
  const cloudSea = new THREE.Points(cloudGeo, cloudMat);
  group.add(cloudSea);

  // 5. 1400 颗漂浮发光萤火与银杏灵尘
  const moteCount = 1400;
  const moteGeo = new THREE.BufferGeometry();
  const motePos = new Float32Array(moteCount * 3);
  const moteCol = new Float32Array(moteCount * 3);
  const cGold = new THREE.Color("#ffd470");
  const cCyan = new THREE.Color("#63e6ff");
  for (let i = 0; i < moteCount; i++) {
    motePos[i * 3 + 0] = (Math.random() - 0.5) * 440;
    motePos[i * 3 + 1] = -40 + Math.random() * 155;
    motePos[i * 3 + 2] = (Math.random() - 0.5) * 440;
    const c = i % 3 === 0 ? cCyan : cGold;
    moteCol[i * 3 + 0] = c.r;
    moteCol[i * 3 + 1] = c.g;
    moteCol[i * 3 + 2] = c.b;
  }
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
  moteGeo.setAttribute("color", new THREE.BufferAttribute(moteCol, 3));
  const moteMat = new THREE.PointsMaterial({
    map: glowTex,
    size: 2.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const spiritMotes = new THREE.Points(moteGeo, moteMat);
  group.add(spiritMotes);

  // 6. 7 个纤细雅致的空中灵气光环（首环偏置右前方，不遮挡七层金顶古塔 C 位）
  const ringCoords: [number, number, number, number][] = [
    [32, 32, 62, -0.35],
    [68, 34, 8, -0.9],
    [76, 38, -62, -1.35],
    [12, 48, -108, 0.15],
    [-72, 42, -58, 1.1],
    [-82, 28, 34, 0.6],
    [-34, 30, 96, -0.35],
  ];
  const rings: RingCheckpoint[] = ringCoords.map(([rx, ry, rz, rotY]) => {
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffe49e,
      emissive: 0xffb32c,
      emissiveIntensity: 0.95,
      metalness: 0.75,
      roughness: 0.2,
    });
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(8.8, 0.24, 12, 40), ringMat);
    mesh.position.set(rx, ry, rz);
    mesh.rotation.y = rotY;
    group.add(mesh);
    return { mesh, position: new THREE.Vector3(rx, ry, rz), passed: false };
  });

  const update = (dt: number, elapsed: number) => {
    // 瀑布流动 UV
    waterfallTex.offset.y += dt * 0.95;

    // 远景浮空岛轻微呼吸悬浮
    for (const isl of floatingIslands) {
      isl.mesh.position.y = isl.baseY + Math.sin(elapsed * 0.45 + isl.phase) * 1.6;
    }

    // 云海缓慢旋转漂移
    cloudSea.rotation.y += dt * 0.008;

    // 灵尘随风轻柔上升飘荡
    spiritMotes.rotation.y += dt * 0.015;
    spiritMotes.position.y = Math.sin(elapsed * 0.35) * 2.2;

    // 光环自转呼吸
    for (let i = 0; i < rings.length; i++) {
      rings[i].mesh.rotation.z = elapsed * 0.65 + i * 0.5;
    }
  };

  return { group, rings, update };
}
