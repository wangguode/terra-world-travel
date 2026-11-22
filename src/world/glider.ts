import * as THREE from "three";

export interface SkyGliderBundle {
  group: THREE.Group;
  trailMesh: THREE.Points;
  updateTrail: (worldPos: THREE.Vector3, boosting: boolean) => void;
}

/**
 * 构建东方灵韵流线滑翔飞行器（Cyber-Crane Sky Glider）+ 发光尾迹粒子
 */
export function createSkyGlider(glowTex: THREE.Texture): SkyGliderBundle {
  const group = new THREE.Group();

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xf4efe6,
    metalness: 0.45,
    roughness: 0.25,
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf5b942,
    emissive: 0xffa62b,
    emissiveIntensity: 0.55,
    metalness: 0.85,
    roughness: 0.2,
  });
  const energyMat = new THREE.MeshStandardMaterial({
    color: 0x7ae8ff,
    emissive: 0x38d9ff,
    emissiveIntensity: 2.2,
    roughness: 0.15,
  });

  // 锐利流线机身（沿 -Z 方向前进）
  const bodyGeo = new THREE.ConeGeometry(0.42, 3.8, 6);
  bodyGeo.rotateX(-Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, hullMat);
  body.castShadow = true;
  group.add(body);

  // 金色背脊
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 2.4), goldTrimMat);
  spine.position.set(0, 0.24, 0.2);
  group.add(spine);

  // 展开的双层羽翼
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.4);
  wingShape.lineTo(2.8, -0.9);
  wingShape.lineTo(2.4, -1.35);
  wingShape.lineTo(0.2, -0.5);
  wingShape.closePath();

  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.06, bevelEnabled: false });
  wingGeo.rotateX(Math.PI / 2);

  const rightWing = new THREE.Mesh(wingGeo, hullMat);
  rightWing.position.set(0.2, 0.05, 0.1);
  rightWing.castShadow = true;
  group.add(rightWing);

  const leftWing = rightWing.clone();
  leftWing.scale.x = -1;
  leftWing.position.x = -0.2;
  group.add(leftWing);

  // 翼尖发光能量边条
  for (const side of [-1, 1]) {
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 1.1), energyMat);
    tip.position.set(side * 2.55, 0.05, 0.95);
    tip.rotation.y = side * 0.22;
    group.add(tip);
  }

  // 尾部核心引擎光环
  const engine = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 10, 20), energyMat);
  engine.position.set(0, 0, 1.85);
  group.add(engine);

  // 发光尾迹粒子（环形缓冲）
  const trailCount = 70;
  const trailPos = new Float32Array(trailCount * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
  const trailMat = new THREE.PointsMaterial({
    color: 0x70e4ff,
    map: glowTex,
    size: 1.5,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const trailMesh = new THREE.Points(trailGeo, trailMat);
  trailMesh.frustumCulled = false;

  let cursor = 0;
  const updateTrail = (worldPos: THREE.Vector3, boosting: boolean) => {
    trailPos[cursor * 3 + 0] = worldPos.x + (Math.random() - 0.5) * 0.35;
    trailPos[cursor * 3 + 1] = worldPos.y + (Math.random() - 0.5) * 0.25;
    trailPos[cursor * 3 + 2] = worldPos.z + (Math.random() - 0.5) * 0.35;
    cursor = (cursor + 1) % trailCount;
    trailGeo.attributes.position.needsUpdate = true;
    trailMat.size = boosting ? 2.4 : 1.45;
    trailMat.color.setHex(boosting ? 0xffcf6e : 0x70e4ff);
  };

  return { group, trailMesh, updateTrail };
}
