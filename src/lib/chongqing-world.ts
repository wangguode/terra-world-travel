import * as THREE from "three";
import * as CANNON from "cannon-es";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Water } from "three/examples/jsm/objects/Water.js";

export interface OsmBuilding {
  p: [number, number][];
  h: number;
}

export interface OsmRoad {
  p: [number, number][];
  w: number;
  b: number;
}

export interface ChongqingOsmData {
  buildings: OsmBuilding[];
  roads: OsmRoad[];
}

export interface ChongqingCheckpoint {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  z: number;
}

export const CHONGQING_CHECKPOINTS: ChongqingCheckpoint[] = [
  { id: "jiefangbei", name: "解放碑中心广场", subtitle: "渝中半岛制高点 · 人民解放纪念碑", x: -130, z: 20 },
  { id: "hongyadong", name: "洪崖洞民俗风貌区", subtitle: "嘉陵江畔 11 层悬崖吊脚楼", x: 110, z: -340 },
  { id: "qiansimen", name: "千厮门嘉陵江大桥", subtitle: "横跨嘉陵江 · 朱红斜拉索大桥", x: 155, z: -510 },
  { id: "raffles", name: "朝天门来福士广场", subtitle: "两江交汇 · 朝天扬帆水晶连廊", x: 740, z: -35 },
  { id: "dongshuimen", name: "东水门长江大桥", subtitle: "横跨长江 · 8D 立体跨江通道", x: 320, z: 440 },
];

/**
 * 8D 魔幻山城渝中半岛高程模型：
 * 中心脊线（解放碑周边）隆起 ~26m，向南北两江（嘉陵江/长江）及东端朝天门陡降入水。
 */
export function getChongqingElevation(x: number, z: number): number {
  // 半岛主轴大致沿 x ∈ [-950, 820], z ∈ [-390, 340]
  const dx = Math.max(0, (x - 520) / 360);
  const northEdge = -370 + Math.max(0, x - 200) * 0.14;
  const southEdge = 330 - Math.max(0, x - 200) * 0.14;

  // 在两江水面外围返回水下高程
  if (x > 880 || z < northEdge - 85 || z > southEdge + 85) {
    return -3.2;
  }

  // 半岛东西向与南北向平滑脊线包络
  const halfSpanZ = Math.max(120, (southEdge - northEdge) * 0.5);
  const centerZ = (northEdge + southEdge) * 0.5;
  const normZ = Math.min(1, Math.abs(z - centerZ) / halfSpanZ);
  const ridge = Math.cos(normZ * Math.PI * 0.5);
  const eastTaper = Math.max(0, 1 - dx * dx);

  // 山城自然起伏微调
  const undulation = Math.sin(x * 0.008) * Math.cos(z * 0.009) * 3.2;
  const h = (ridge * 24 + undulation) * eastTaper + 1.2;
  return Math.max(-3.0, h);
}

/**
 * 创建赛博跑车 3D 模型（含发光车灯、尾灯、车窗与四轮）
 */
export function createSportsCarMesh(): {
  group: THREE.Group;
  wheels: THREE.Mesh[];
} {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xff3b30,
    metalness: 0.78,
    roughness: 0.22,
    envMapIntensity: 1.4,
  });
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x0f1722,
    metalness: 0.85,
    roughness: 0.14,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x1e242c,
    metalness: 0.5,
    roughness: 0.5,
  });
  const headLightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfff3d1,
    emissiveIntensity: 2.2,
  });
  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xff1e1e,
    emissive: 0xff1e1e,
    emissiveIntensity: 2.4,
  });

  // 车身底盘
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.58, 4.5), bodyMat);
  chassis.position.y = 0.62;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  // 流线座舱
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.52, 2.2), cabinMat);
  cabin.position.set(0, 1.1, -0.15);
  cabin.castShadow = true;
  group.add(cabin);

  // 尾翼
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.34), trimMat);
  spoiler.position.set(0, 1.12, -2.05);
  group.add(spoiler);

  // 前后灯组（车头朝向 +Z）
  for (const sx of [-0.7, 0.7]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.08), headLightMat);
    hl.position.set(sx, 0.65, 2.26);
    group.add(hl);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.08), tailLightMat);
    tl.position.set(sx, 0.68, -2.26);
    group.add(tl);
  }

  // 四轮
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x16181d, roughness: 0.75, metalness: 0.2 });
  const wheelOffsets: [number, number, number][] = [
    [-1.02, 0.38, 1.38],
    [1.02, 0.38, 1.38],
    [-1.02, 0.38, -1.38],
    [1.02, 0.38, -1.38],
  ];
  const wheels = wheelOffsets.map(([wx, wy, wz]) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(wx, wy, wz);
    w.castShadow = true;
    group.add(w);
    return w;
  });

  return { group, wheels };
}

export interface BuildingCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  maxY: number;
}

export interface ChongqingWorldBundle {
  group: THREE.Group;
  water: Water;
  colliders: BuildingCollider[];
  roads: OsmRoad[];
  carMesh: THREE.Group;
  carWheels: THREE.Mesh[];
  beaconGroup: THREE.Group;
}

/**
 * 构建完整 8D 魔幻重庆（渝中半岛 OSM 真实路网 + 502 栋建筑 + 两江水面 + 地标群）
 */
export function buildChongqingWorld(
  data: ChongqingOsmData,
  facadeTex: THREE.Texture,
  waterNormals: THREE.Texture,
  sunDirection: THREE.Vector3
): ChongqingWorldBundle {
  const group = new THREE.Group();
  const colliders: BuildingCollider[] = [];

  // 1. 渝中半岛 8D 山地地形
  const terrainGeo = new THREE.PlaneGeometry(2400, 1600, 140, 100);
  terrainGeo.rotateX(-Math.PI / 2);
  const tPos = terrainGeo.attributes.position;
  const tCol = new Float32Array(tPos.count * 3);
  for (let i = 0; i < tPos.count; i++) {
    const x = tPos.getX(i);
    const z = tPos.getZ(i);
    const h = getChongqingElevation(x, z);
    tPos.setY(i, h);
    if (h < 1.2) {
      // 江岸礁石
      tCol[i * 3 + 0] = 0.25;
      tCol[i * 3 + 1] = 0.27;
      tCol[i * 3 + 2] = 0.26;
    } else if (h < 9) {
      // 滨江山坡绿植
      tCol[i * 3 + 0] = 0.18;
      tCol[i * 3 + 1] = 0.30;
      tCol[i * 3 + 2] = 0.21;
    } else {
      // 城区街区地面
      tCol[i * 3 + 0] = 0.23;
      tCol[i * 3 + 1] = 0.25;
      tCol[i * 3 + 2] = 0.28;
    }
  }
  terrainGeo.setAttribute("color", new THREE.BufferAttribute(tCol, 3));
  terrainGeo.computeVertexNormals();
  const terrainMesh = new THREE.Mesh(
    terrainGeo,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.05 })
  );
  terrainMesh.receiveShadow = true;
  group.add(terrainMesh);

  // 2. 长江 & 嘉陵江两江水面
  const water = new Water(new THREE.PlaneGeometry(4200, 3200), {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals,
    sunDirection: sunDirection.clone().normalize(),
    sunColor: 0xffe4b8,
    waterColor: 0x134257,
    distortionScale: 2.8,
    fog: true,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.6;
  group.add(water);

  // 3. 合批 502 栋 OSM 真实建筑（仅 2 个 Draw Calls！）
  const tallGeos: THREE.BufferGeometry[] = [];
  const lowGeos: THREE.BufferGeometry[] = [];

  for (const b of data.buildings) {
    if (b.p.length < 3) continue;
    let cx = 0;
    let cz = 0;
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const [px, pz] of b.p) {
      cx += px;
      cz += pz;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (pz < minZ) minZ = pz;
      if (pz > maxZ) maxZ = pz;
    }
    cx /= b.p.length;
    cz /= b.p.length;

    const baseElev = getChongqingElevation(cx, cz);
    if (baseElev < 0.2) continue;

    const shape = new THREE.Shape();
    shape.moveTo(b.p[0][0] - cx, -(b.p[0][1] - cz));
    for (let i = 1; i < b.p.length; i++) {
      shape.lineTo(b.p[i][0] - cx, -(b.p[i][1] - cz));
    }
    shape.closePath();

    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: b.h,
      bevelEnabled: false,
      steps: 1,
    });
    extrude.rotateX(-Math.PI / 2);
    extrude.translate(cx, baseElev - 2.0, cz);

    colliders.push({
      minX: minX - 1.2,
      maxX: maxX + 1.2,
      minZ: minZ - 1.2,
      maxZ: maxZ + 1.2,
      maxY: baseElev + b.h,
    });

    if (b.h >= 36) {
      tallGeos.push(extrude);
    } else {
      lowGeos.push(extrude);
    }
  }

  const osmBuildingTex = facadeTex.clone();
  osmBuildingTex.repeat.set(0.055, 0.04);
  osmBuildingTex.needsUpdate = true;

  if (tallGeos.length > 0) {
    const mergedTall = mergeGeometries(tallGeos, false);
    if (mergedTall) {
      const tallMat = new THREE.MeshStandardMaterial({
        color: 0xdbe7f3,
        map: osmBuildingTex,
        emissive: 0xffd79a,
        emissiveMap: osmBuildingTex,
        emissiveIntensity: 0.48,
        metalness: 0.65,
        roughness: 0.28,
      });
      const tallMesh = new THREE.Mesh(mergedTall, tallMat);
      tallMesh.castShadow = true;
      tallMesh.receiveShadow = true;
      group.add(tallMesh);
    }
    tallGeos.forEach((g) => g.dispose());
  }

  if (lowGeos.length > 0) {
    const mergedLow = mergeGeometries(lowGeos, false);
    if (mergedLow) {
      const lowMat = new THREE.MeshStandardMaterial({
        color: 0xc2b8aa,
        map: osmBuildingTex,
        emissive: 0xffc982,
        emissiveMap: osmBuildingTex,
        emissiveIntensity: 0.28,
        metalness: 0.18,
        roughness: 0.72,
      });
      const lowMesh = new THREE.Mesh(mergedLow, lowMat);
      lowMesh.castShadow = true;
      lowMesh.receiveShadow = true;
      group.add(lowMesh);
    }
    lowGeos.forEach((g) => g.dispose());
  }

  // 4. 合批 271 条 OSM 真实路网（抬高至地形之上，避免地形三角面遮挡道路）
  const roadGeos: THREE.BufferGeometry[] = [];
  for (const road of data.roads) {
    for (let i = 0; i < road.p.length - 1; i++) {
      const [x1, z1] = road.p[i];
      const [x2, z2] = road.p[i + 1];
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      if (len < 1.5) continue;
      const mx = (x1 + x2) * 0.5;
      const mz = (z1 + z2) * 0.5;
      const y1 = road.b ? 16 : getChongqingElevation(x1, z1) + 1.15;
      const y2 = road.b ? 16 : getChongqingElevation(x2, z2) + 1.15;
      const seg = new THREE.BoxGeometry(road.w, 0.9, len + 1.0);
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(dx, y2 - y1, dz).normalize()
      );
      const mat4 = new THREE.Matrix4().compose(
        new THREE.Vector3(mx, (y1 + y2) * 0.5, mz),
        quat,
        new THREE.Vector3(1, 1, 1)
      );
      seg.applyMatrix4(mat4);
      roadGeos.push(seg.toNonIndexed());
      seg.dispose();
    }
  }
  if (roadGeos.length > 0) {
    const mergedRoads = mergeGeometries(roadGeos, false);
    if (mergedRoads) {
      const roadMesh = new THREE.Mesh(
        mergedRoads,
        new THREE.MeshStandardMaterial({ color: 0x262a31, roughness: 0.85, metalness: 0.1 })
      );
      roadMesh.receiveShadow = true;
      group.add(roadMesh);
    }
    roadGeos.forEach((g) => g.dispose());
  }

  // 5. 四大重庆地标建筑（解放碑 / 洪崖洞 / 来福士朝天扬帆 / 千厮门&东水门大桥）
  const landmarks = new THREE.Group();

  // 5.1 解放碑
  const jfbY = getChongqingElevation(-130, 20);
  const jfbBase = new THREE.Mesh(
    new THREE.CylinderGeometry(7, 8.5, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0xd6cfc2, roughness: 0.65 })
  );
  jfbBase.position.set(-130, jfbY + 2, 20);
  const jfbTower = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 3.8, 28, 8),
    new THREE.MeshStandardMaterial({ color: 0xeee8dc, roughness: 0.5 })
  );
  jfbTower.position.set(-130, jfbY + 18, 20);
  const jfbClock = new THREE.Mesh(
    new THREE.CylinderGeometry(3.1, 3.1, 3.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x202833, emissive: 0xffcf70, emissiveIntensity: 0.9 })
  );
  jfbClock.position.set(-130, jfbY + 27, 20);
  landmarks.add(jfbBase, jfbTower, jfbClock);

  // 5.2 洪崖洞金色悬崖吊脚楼群
  const hydGroup = new THREE.Group();
  const hydGoldMat = new THREE.MeshStandardMaterial({
    color: 0x6b3e24,
    emissive: 0xff9f2e,
    emissiveIntensity: 0.85,
    roughness: 0.55,
  });
  const hydRoofMat = new THREE.MeshStandardMaterial({ color: 0x2c323b, roughness: 0.7 });
  for (let tier = 0; tier < 6; tier++) {
    const w = 68 - tier * 5;
    const block = new THREE.Mesh(new THREE.BoxGeometry(w, 5.2, 18), hydGoldMat);
    block.position.set(110, 2 + tier * 5.2, -355 + tier * 3.5);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 4, 0.8, 20), hydRoofMat);
    roof.position.set(110, 4.9 + tier * 5.2, -355 + tier * 3.5);
    hydGroup.add(block, roof);
  }
  landmarks.add(hydGroup);

  // 5.3 朝天门来福士“朝天扬帆”双排摩天塔 + 水晶连廊
  const rcGroup = new THREE.Group();
  const rcGlassMat = new THREE.MeshStandardMaterial({
    color: 0x8cc8ef,
    map: facadeTex,
    emissive: 0x4ea8de,
    emissiveMap: facadeTex,
    emissiveIntensity: 0.45,
    metalness: 0.82,
    roughness: 0.16,
  });
  const towerPositions: [number, number, number][] = [
    [710, -90, 145],
    [735, -40, 175],
    [740, 15, 175],
    [715, 65, 145],
    [775, -75, 120],
    [790, -15, 130],
    [785, 45, 120],
  ];
  for (const [tx, tz, th] of towerPositions) {
    const ty = getChongqingElevation(tx, tz);
    const tower = new THREE.Mesh(new THREE.BoxGeometry(20, th, 20), rcGlassMat);
    tower.position.set(tx, ty + th * 0.5 - 2, tz);
    tower.castShadow = true;
    rcGroup.add(tower);
  }
  // 250米高空水晶连廊
  const skybridge = new THREE.Mesh(
    new THREE.BoxGeometry(26, 12, 175),
    new THREE.MeshStandardMaterial({
      color: 0xd9f2ff,
      emissive: 0x70c7ff,
      emissiveIntensity: 0.55,
      metalness: 0.85,
      roughness: 0.15,
    })
  );
  skybridge.position.set(738, 175, -15);
  rcGroup.add(skybridge);
  landmarks.add(rcGroup);

  // 5.4 千厮门 & 东水门跨江斜拉索大桥（可驾驶通行）
  const bridgeDeckMat = new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.8 });
  const bridgePylonMat = new THREE.MeshStandardMaterial({
    color: 0xc9382c,
    emissive: 0x5c100a,
    emissiveIntensity: 0.25,
    roughness: 0.45,
  });
  const addBridge = (bx: number, bz: number, length: number) => {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(16, 1.4, length), bridgeDeckMat);
    deck.position.set(bx, 15.5, bz);
    deck.receiveShadow = true;
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(18, 64, 5), bridgePylonMat);
    pylon.position.set(bx, 32, bz);
    landmarks.add(deck, pylon);
  };
  addBridge(155, -520, 420); // 千厮门大桥
  addBridge(320, 440, 420);  // 东水门大桥

  group.add(landmarks);

  // 6. 玩家跑车 & 任务光柱指引（出生在千厮门嘉陵江大桥桥面，正对洪崖洞与渝中半岛天际线！）
  const { group: carMesh, wheels: carWheels } = createSportsCarMesh();
  carMesh.position.set(155, 16.45, -480);
  carMesh.rotation.y = 0;
  group.add(carMesh);

  const beaconGroup = new THREE.Group();
  const beaconBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.2, 120, 20, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x2997ff,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  beaconBeam.position.y = 60;
  const beaconRing = new THREE.Mesh(
    new THREE.RingGeometry(4.5, 6.2, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd60a, side: THREE.DoubleSide })
  );
  beaconRing.rotation.x = -Math.PI / 2;
  beaconRing.position.y = 0.6;
  beaconGroup.add(beaconBeam, beaconRing);
  group.add(beaconGroup);

  return { group, water, colliders, roads: data.roads, carMesh, carWheels, beaconGroup };
}

/**
 * 基于 cannon-es 的街机风格 GTA 车辆动力学与建筑碰撞控制器
 */
export class ChongqingVehicleController {
  world: CANNON.World;
  carBody: CANNON.Body;
  speed = 0;
  heading = 0;
  steer = 0;
  private colliders: BuildingCollider[];

  constructor(colliders: BuildingCollider[], spawnX = 155, spawnZ = -480, heading = 0) {
    this.colliders = colliders;
    this.heading = heading;
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, 0);

    const onBridge = Math.abs(spawnX - 155) < 12 && spawnZ < -310 && spawnZ > -730;
    this.carBody = new CANNON.Body({
      mass: 1200,
      position: new CANNON.Vec3(spawnX, onBridge ? 16.45 : getChongqingElevation(spawnX, spawnZ) + 0.9, spawnZ),
      linearDamping: 0.35,
    });
    this.carBody.addShape(new CANNON.Box(new CANNON.Vec3(1.1, 0.6, 2.3)));
    this.world.addBody(this.carBody);
  }

  step(
    dt: number,
    input: { forward: boolean; backward: boolean; left: boolean; right: boolean; brake: boolean; boost: boolean }
  ) {
    const accel = input.boost ? 48 : 30;
    if (input.forward) this.speed += accel * dt;
    if (input.backward) this.speed -= 24 * dt;

    // 刹车与自然阻力
    const drag = input.brake ? 0.88 : 0.985;
    this.speed *= Math.pow(drag, dt * 60);
    const maxSpeed = input.boost ? 56 : 42;
    this.speed = Math.max(-16, Math.min(maxSpeed, this.speed));

    // 转向（手刹漂移时转向更灵敏）
    const steerInput = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    this.steer += (steerInput * 0.55 - this.steer) * Math.min(1, dt * 10);
    if (Math.abs(this.speed) > 0.4) {
      const turnRate = (input.brake ? 2.6 : 1.85) * Math.sign(this.speed) * Math.min(1, Math.abs(this.speed) / 8);
      this.heading += this.steer * turnRate * dt;
    }

    const vx = Math.sin(this.heading) * this.speed;
    const vz = Math.cos(this.heading) * this.speed;
    let nextX = this.carBody.position.x + vx * dt;
    let nextZ = this.carBody.position.z + vz * dt;

    // 边界保护（渝中半岛及两江大桥范围）
    nextX = Math.max(-920, Math.min(860, nextX));
    nextZ = Math.max(-740, Math.min(680, nextZ));

    // 建筑碰撞盒反推
    for (const c of this.colliders) {
      if (nextX > c.minX && nextX < c.maxX && nextZ > c.minZ && nextZ < c.maxZ) {
        const dxMin = Math.abs(nextX - c.minX);
        const dxMax = Math.abs(c.maxX - nextX);
        const dzMin = Math.abs(nextZ - c.minZ);
        const dzMax = Math.abs(c.maxZ - nextZ);
        const m = Math.min(dxMin, dxMax, dzMin, dzMax);
        if (m === dxMin) nextX = c.minX - 0.1;
        else if (m === dxMax) nextX = c.maxX + 0.1;
        else if (m === dzMin) nextZ = c.minZ - 0.1;
        else nextZ = c.maxZ + 0.1;
        this.speed *= -0.35;
        break;
      }
    }

    // 桥面与山地高程吸附（千厮门大桥 / 东水门大桥桥面保持 16.45m）
    const onQiansimen = Math.abs(nextX - 155) < 12 && nextZ < -310 && nextZ > -730;
    const onDongshuimen = Math.abs(nextX - 320) < 12 && nextZ > 230 && nextZ < 650;
    const targetY = onQiansimen || onDongshuimen ? 16.45 : Math.max(0.2, getChongqingElevation(nextX, nextZ)) + 0.9;

    this.carBody.position.set(nextX, targetY, nextZ);
    this.world.step(1 / 60, dt, 2);
  }
}
