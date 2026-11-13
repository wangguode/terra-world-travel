import * as THREE from "three";

/** Timber hall with curved tile roofs, repeated joinery and an open central nave.
 * Authored for this project; no third-party model or texture downloads.
 */
export function createTempleArchitecture(): THREE.Group {
  // Generic stone/wood surfaces reuse the imported CC BY 4.0 Bistro PBR set;
  // attribution is retained alongside the assets and shown in the temple view.
  const loader = new THREE.TextureLoader();
  const surface = (name: string, color = true, repeats = 1) => {
    const texture = loader.load(`/models/bistro/Textures/${name}.avif`);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeats, repeats);
    texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.anisotropy = 4;
    return texture;
  };
  const stoneMap = surface("Concrete2_BaseColor", true, 3);
  const stoneNormal = surface("Concrete2_Normal", false, 3);
  const timberMap = surface("MASTER_Wood_Brown_BaseColor", true, 2);
  const timberNormal = surface("MASTER_Wood_Brown_Normal", false, 2);
  const roofMap = surface("MASTER_Roofing_Shingle_Green_BaseColor", true, 8);
  const roofNormal = surface("MASTER_Roofing_Shingle_Green_Normal", false, 8);
  const hall = new THREE.Group();
  hall.name = "Timber prayer hall";
  const stone = new THREE.MeshStandardMaterial({ color: 0xd1c7b0, map: stoneMap, normalMap: stoneNormal, normalScale: new THREE.Vector2(.35,.35), roughness: 0.94 });
  const darkStone = new THREE.MeshStandardMaterial({ color: 0x8f8e7c, map: stoneMap, normalMap: stoneNormal, roughness: 0.95 });
  const timber = new THREE.MeshStandardMaterial({ color: 0x8e6750, map: timberMap, normalMap: timberNormal, roughness: 0.77 });
  const red = new THREE.MeshStandardMaterial({ color: 0x742b22, roughness: 0.73 });
  const brass = new THREE.MeshStandardMaterial({ color: 0x8b703d, metalness: 0.68, roughness: 0.52 });
  const plaster = new THREE.MeshStandardMaterial({ color: 0xb9ad90, roughness: 0.98 });
  const slate = new THREE.MeshStandardMaterial({ color: 0x626b5c, map: roofMap, normalMap: roofNormal, roughness: 0.87 });

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    hall.add(mesh);
    return mesh;
  };
  const cylinder = (r: number, height: number, x: number, y: number, z: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.035, height, 16), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    hall.add(mesh);
    return mesh;
  };

  // Stepped stone plinth; broad stairs leave the sightline to the altar clear.
  box(30, 0.65, 24, 0, 0.325, -4, darkStone);
  box(29.2, 0.7, 23.2, 0, 1, -4, stone);
  box(30, 0.24, 24, 0, 1.47, -4, stone);
  for (let step = 0; step < 6; step++) {
    box(10.5, 0.26 * (step + 1), 0.72, 0, 0.13 * (step + 1), 11.6 - step * 0.69, stone);
  }
  // Individual paving divisions catch direct light without dense geometry.
  for (let x = -14; x <= 14; x += 2) {
    box(0.025, 0.015, 22.7, x, 1.6, -4, darkStone);
  }
  for (let z = -15; z <= 7; z += 2) {
    box(28.3, 0.015, 0.025, 0, 1.6, z, darkStone);
  }

  const columnXs = [-12, -6, 6, 12];
  const columnZs = [6, -4, -14];
  for (const x of columnXs) for (const z of columnZs) {
    cylinder(0.75, 0.38, x, 1.79, z, darkStone);
    cylinder(0.62, 0.4, x, 2.17, z, stone);
    cylinder(0.39, 5.5, x, 5.05, z, red);
    cylinder(0.44, 0.16, x, 2.42, z, brass);
    cylinder(0.46, 0.2, x, 7.74, z, timber);
    // Interlocking bracket arms, stepped outward beneath the eaves.
    for (let tier = 0; tier < 3; tier++) {
      box(1.15 + tier * 0.48, 0.2, 0.42, x, 7.9 + tier * 0.26, z, timber);
      box(0.42, 0.2, 1.15 + tier * 0.48, x, 8.04 + tier * 0.26, z, timber);
    }
  }
  for (const z of columnZs) {
    box(26.4, 0.48, 0.42, 0, 7.78, z, timber);
    box(26.8, 0.18, 0.55, 0, 8.23, z, red);
  }
  for (const x of [-12, 12]) {
    box(0.45, 0.45, 21, x, 7.78, -4, timber);
  }

  // Solid rear wall and side bays; narrow wood lattice screens retain depth.
  box(25, 5.7, 0.35, 0, 4.45, -14.7, plaster);
  for (const x of [-12.65, 12.65]) {
    box(0.3, 1.4, 20, x, 2.3, -4, plaster);
    box(0.3, 0.22, 20, x, 3.1, -4, timber);
    for (let z = -13.5; z < 5.8; z += 0.56) {
      box(0.14, 3.7, 0.075, x, 5.05, z, timber);
    }
    for (let y = 3.65; y < 7; y += 0.65) {
      box(0.14, 0.075, 20, x, y, -4, timber);
    }
  }
  for (const x of [-9, -3, 3, 9]) {
    box(0.2, 5.5, 0.24, x, 4.4, -14.4, timber);
  }

  // Roof surface follows a shallow catenary-inspired eave profile. Cylinder
  // tiles are instanced: thousands of visible tile courses cost two draw calls.
  const buildRoof = (width: number, depth: number, eaveY: number, rise: number) => {
    const segments = 20;
    const halfDepth = depth / 2;
    const centerZ = -4;
    const heightAt = (t: number) => eaveY + rise * (1 - t) ** 1.55 + 0.52 * t ** 8;
    const slopeWidth = Math.floor(width / 0.46);
    const tiles = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.06, 0.065, 1, 7, 1, true),
      slate,
      slopeWidth * segments * 2,
    );
    tiles.castShadow = true;
    tiles.receiveShadow = true;
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    let tileIndex = 0;
    for (const side of [-1, 1]) {
      const vertices: number[] = [];
      const indices: number[] = [];
      const uvs: number[] = [];
      for (let row = 0; row <= segments; row++) {
        const t = row / segments;
        const corner = 0.62 * t ** 6;
        uvs.push(0, t, 1, t);
        vertices.push(-width / 2 - corner, heightAt(t), centerZ + side * t * halfDepth);
        vertices.push(width / 2 + corner, heightAt(t), centerZ + side * t * halfDepth);
        if (row < segments) {
          const i = row * 2;
          indices.push(i, i + 1, i + 2, i + 1, i + 3, i + 2);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x7d8874, map: roofMap, normalMap: roofNormal, roughness: 0.9, side: THREE.DoubleSide });
      const roof = new THREE.Mesh(geometry, roofMaterial);
      roof.castShadow = true;
      roof.receiveShadow = true;
      hall.add(roof);
      for (let row = 0; row < segments; row++) {
        const t0 = row / segments;
        const t1 = (row + 1) / segments;
        const start = new THREE.Vector3(0, heightAt(t0) + 0.045, centerZ + side * t0 * halfDepth);
        const end = new THREE.Vector3(0, heightAt(t1) + 0.045, centerZ + side * t1 * halfDepth);
        const direction = end.clone().sub(start);
        rotation.setFromUnitVectors(up, direction.clone().normalize());
        const midpoint = start.clone().add(end).multiplyScalar(0.5);
        for (let col = 0; col < slopeWidth; col++) {
          midpoint.x = (col - (slopeWidth - 1) / 2) * 0.46;
          matrix.compose(midpoint, rotation, new THREE.Vector3(1, direction.length() * 1.075, 1));
          tiles.setMatrixAt(tileIndex++, matrix);
        }
      }
      // Strong fascia and layered edge purlins give the silhouette weight.
      box(width + 0.8, 0.23, 0.28, 0, heightAt(1) - 0.15, centerZ + side * halfDepth, timber);
      for (let x = -width / 2; x <= width / 2; x += 0.92) {
        const rafter = box(0.12, 0.2, depth * 0.5, x, eaveY + rise * 0.4 - 0.3, centerZ + side * halfDepth * 0.5, timber);
        rafter.rotation.x = -side * Math.atan2(rise, halfDepth);
      }
    }
    hall.add(tiles);
    const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, width + 0.7, 12), slate);
    ridge.rotation.z = Math.PI / 2;
    ridge.position.set(0, eaveY + rise + 0.15, centerZ);
    ridge.castShadow = true;
    hall.add(ridge);
    for (const side of [-1, 1]) {
      // Swept ridge ends, avoiding cartoon dragon ornaments.
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * (width / 2 - 0.6), eaveY + rise + 0.16, centerZ),
        new THREE.Vector3(side * (width / 2 + 0.45), eaveY + rise + 0.32, centerZ),
        new THREE.Vector3(side * (width / 2 + 0.82), eaveY + rise + 0.95, centerZ),
      ]);
      hall.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.19, 8, false), slate));
    }
  };
  buildRoof(32.5, 26, 8.5, 3.7);
  buildRoof(25.5, 18.5, 11.1, 3.3);
  // Clerestory between the two tiers.
  box(23, 1.35, 0.2, 0, 11.6, 3.6, timber);
  for (let x = -11; x <= 11; x += 0.5) {
    box(0.08, 1.2, 0.28, x, 11.65, 3.75, brass);
  }

  // Suspended silk lanterns: restrained warm emissive fabric, not neon halos.
  const silk = new THREE.MeshStandardMaterial({ color: 0xbc622e, roughness: 0.95, emissive: 0xe5a456, emissiveIntensity: 0.45 });
  for (const x of [-9, 9]) {
    cylinder(0.045, 0.8, x, 7.25, 6.3, timber);
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), silk);
    lantern.scale.y = 1.3;
    lantern.position.set(x, 6.25, 6.3);
    hall.add(lantern);
    cylinder(0.34, 0.12, x, 6.92, 6.3, brass);
    cylinder(0.3, 0.12, x, 5.6, 6.3, brass);
    cylinder(0.025, 0.6, x, 5.25, 6.3, red);
    const light = new THREE.PointLight(0xffc481, 9, 12, 2);
    light.position.set(x, 5.9, 6.8);
    hall.add(light);
  }
  // Preserve the detailed hall as a reusable pavilion, then compose a complete
  // mountain pilgrimage precinct around one north–south ceremonial axis.
  const precinct = new THREE.Group();
  precinct.name = "Mountain Buddhist sanctuary";
  hall.position.z = -22;
  precinct.add(hall);
  const addBox = (w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    precinct.add(mesh);
    return mesh;
  };
  const batch = (geo: THREE.BufferGeometry, mat: THREE.Material, placements: Array<[number, number, number, number, number, number]>) => {
    const mesh = new THREE.InstancedMesh(geo, mat, placements.length);
    const dummy = new THREE.Object3D();
    placements.forEach(([x, y, z, sx, sy, sz], i) => {
      dummy.position.set(x, y, z); dummy.scale.set(sx, sy, sz); dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.castShadow = true; mesh.receiveShadow = true; precinct.add(mesh);
    return mesh;
  };
  // Broad forecourt, raised stone processional walk, and lower planted beds.
  addBox(116, 0.35, 158, 0, -0.2, -8, darkStone);
  addBox(19, 0.18, 123, 0, 0.06, -7, stone);
  const joints: Array<[number, number, number, number, number, number]> = [];
  for (let z = -64; z < 55; z += 2.4) joints.push([0, 0.16, z, 18.7, 0.014, 0.035]);
  for (const x of [-6.25, 0, 6.25]) joints.push([x, 0.16, -5, 0.035, 0.014, 120]);
  batch(new THREE.BoxGeometry(1, 1, 1), darkStone, joints);
  // Subsidiary scripture and meditation halls occupy their own courtyard bays.
  for (const side of [-1, 1]) {
    const wing = hall.clone(true);
    wing.position.set(side * 36, 0, -20);
    wing.scale.setScalar(0.54);
    wing.rotation.y = side * Math.PI / 2;
    // The main hall's lanterns alone provide illumination; cloned wings need
    // no extra real-time lights.
    const lights: THREE.Object3D[] = [];
    wing.traverse((object) => { if (object instanceof THREE.Light) lights.push(object); });
    lights.forEach((light) => light.removeFromParent());
    precinct.add(wing);
  }
  // Long covered cloisters, with individual roof tiles expressed as ridges.
  const corridorColumns: Array<[number, number, number, number, number, number]> = [];
  const corridorBeams: Array<[number, number, number, number, number, number]> = [];
  for (const side of [-1, 1]) {
    const x = side * 47;
    addBox(7, 0.45, 78, x, 0.225, -3, stone);
    for (let z = -40; z <= 34; z += 4) {
      for (const dx of [-2.4, 2.4]) corridorColumns.push([x + dx, 2.7, z, 0.24, 4.5, 0.24]);
      corridorBeams.push([x, 5, z, 6, 0.25, 0.25]);
    }
    addBox(0.28, 0.35, 78, x - 2.4, 4.95, -3, timber);
    addBox(0.28, 0.35, 78, x + 2.4, 4.95, -3, timber);
    for (const roofSide of [-1, 1]) {
      const slab = addBox(4.1, 0.19, 81, x + roofSide * 1.85, 5.7, -3, slate);
      slab.rotation.z = -roofSide * 0.28;
    }
    for (let z = -43; z < 37; z += 0.55) {
      corridorBeams.push([x, 6.28, z, 0.18, 0.18, 0.28]);
    }
  }
  batch(new THREE.CylinderGeometry(1, 1.06, 1, 10), red, corridorColumns);
  batch(new THREE.BoxGeometry(1, 1, 1), timber, corridorBeams);

  // Southern three-bay paifang: open portal framing the first mountain vista.
  for (const x of [-13, -5.6, 5.6, 13]) {
    addBox(1.5, 0.55, 1.5, x, 0.28, 45, stone);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 8, 16), red);
    pillar.position.set(x, 4.55, 45); precinct.add(pillar);
    addBox(2.1, 0.3, 1.2, x, 8.1, 45, timber);
  }
  addBox(29, 0.65, 0.8, 0, 7.8, 45, red);
  addBox(10.6, 1.6, 0.42, 0, 8.35, 45, timber);
  for (const side of [-1, 1]) {
    const eave = addBox(31, 0.22, 3.4, 0, 9.55, 45 + side * 1.5, slate);
    eave.rotation.x = side * 0.32;
  }
  addBox(32, 0.26, 0.35, 0, 10.05, 45, slate);

  // Lotus pools flank a low arched ceremonial bridge at the entrance.
  const water = new THREE.MeshPhysicalMaterial({ color: 0x385e58, roughness: 0.2, metalness: 0.22, clearcoat: 0.8 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x526c45, roughness: 0.85, side: THREE.DoubleSide });
  for (const side of [-1, 1]) {
    addBox(27, 0.22, 18, side * 25, 0.02, 27, water);
    for (const dz of [-9.3, 9.3]) addBox(28, 0.6, 0.6, side * 25, 0.25, 27 + dz, stone);
    for (const dx of [-13.8, 13.8]) addBox(0.6, 0.6, 18, side * 25 + dx, 0.25, 27, stone);
    for (let i = 0; i < 22; i++) {
      const pad = new THREE.Mesh(new THREE.CircleGeometry(0.4 + (i % 3) * 0.17, 12), leaf);
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(side * 25 + Math.sin(i * 2.4) * 11, 0.16, 27 + Math.cos(i * 1.8) * 7);
      precinct.add(pad);
    }
  }
  for (let step = 0; step < 11; step++) {
    const z = 19 + step * 1.45;
    const h = 0.4 + Math.sin(step / 10 * Math.PI) * 0.85;
    addBox(11, h, 1.5, 0, h / 2, z, stone);
  }
  // Stone balustrades use shared geometry for all posts and rails.
  const posts: Array<[number, number, number, number, number, number]> = [];
  const rails: Array<[number, number, number, number, number, number]> = [];
  for (const side of [-1, 1]) {
    for (let z = -64; z <= 38; z += 3) {
      if (z > -39 && z < -10) continue; // main hall entry and raised platform
      const x = side * 10.6;
      posts.push([x, 0.9, z, 0.35, 1.7, 0.35]);
      rails.push([x, 1.35, z + 1.4, 0.18, 0.2, 2.8]);
      rails.push([x, 0.65, z + 1.4, 0.14, 0.15, 2.8]);
    }
  }
  // Northern ascending terrace reaches the giant Buddha's lotus platform.
  for (let step = 0; step < 32; step++) {
    const z = -49 - step * 1.05;
    const h = 0.25 * (step + 1);
    addBox(21, h, 1.08, 0, h / 2, z, stone);
    for (const side of [-1, 1]) {
      posts.push([side * 11.2, h + 0.85, z, 0.38, 1.7, 0.38]);
      rails.push([side * 11.2, h + 1.3, z, 0.23, 0.2, 1.15]);
    }
  }
  const terrace = new THREE.Mesh(new THREE.CylinderGeometry(20, 23, 8, 64), darkStone);
  terrace.position.set(0, 4, -91); terrace.receiveShadow = true; precinct.add(terrace);
  const terraceCap = new THREE.Mesh(new THREE.CylinderGeometry(20.5, 20.5, 0.4, 64), stone);
  terraceCap.position.set(0, 8, -91); terraceCap.receiveShadow = true; precinct.add(terraceCap);
  for (let i = 0; i < 55; i++) {
    const angle = i / 55 * Math.PI * 2;
    // Leave a south-facing entrance where the stairs meet the terrace.
    if (Math.sin(angle) > 0.88 && Math.abs(Math.cos(angle)) < 0.5) continue;
    posts.push([Math.cos(angle) * 19.3, 8.9, -91 + Math.sin(angle) * 19.3, 0.38, 1.65, 0.38]);
  }
  batch(new THREE.BoxGeometry(1, 1, 1), stone, posts);
  batch(new THREE.BoxGeometry(1, 1, 1), stone, rails);
  // Large restrained fabric standards mark the processional axis.
  const bannerMat = new THREE.MeshStandardMaterial({ color: 0x99734a, roughness: 1, side: THREE.DoubleSide });
  for (const side of [-1, 1]) for (const z of [9, -8, -42, -61]) {
    const x = side * 17;
    addBox(0.12, 8.5, 0.12, x, 4.25, z, brass);
    addBox(2.2, 0.08, 0.12, x + side, 7.8, z, brass);
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 4.5, 1, 8), bannerMat);
    cloth.position.set(x + side, 5.5, z);
    precinct.add(cloth);
    addBox(1.65, 0.11, 0.09, x + side, 4.1, z + 0.025, timber);
  }
  return precinct;
}
