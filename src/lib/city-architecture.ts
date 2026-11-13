import * as THREE from "three";

// A coherent pedestrian boulevard, in metres. All geometry is authored here;
// facade details share instanced geometry instead of hundreds of draw calls.
export function createCityArchitecture(): THREE.Group {
  const city = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: 0x8f8a7d, roughness: 0.86 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xc5bcb0, roughness: 0.78 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x344146, roughness: 0.34, metalness: 0.72 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x435962, metalness: 0.62, roughness: 0.2 });
  const lit = new THREE.MeshStandardMaterial({ color: 0xb09b7a, emissive: 0xffc57f, emissiveIntensity: 0.65, roughness: 0.4 });
  const road = new THREE.MeshStandardMaterial({ color: 0x33383b, roughness: 0.87 });
  const white = new THREE.MeshStandardMaterial({ color: 0xc9c5b7, roughness: 0.86 });
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const add = (x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(cube, material);
    mesh.position.set(x, y, z); mesh.scale.set(w, h, d);
    mesh.castShadow = true; mesh.receiveShadow = true; city.add(mesh); return mesh;
  };
  add(0, -0.15, -35, 220, 0.25, 260, road);
  // Wide central walkway and lower traffic lanes. Keep spawn in the pedestrian zone.
  add(0, -0.015, -30, 15, 0.16, 240, stone);
  for (const side of [-1, 1]) {
    add(side * 15.5, 0, -30, 7, 0.3, 240, concrete);
    add(side * 11.4, 0.01, -30, 0.22, 0.18, 240, white);
    for (let z = -140; z < 85; z += 8) add(side * 9.5, 0.015, z, 0.1, 0.03, 3.5, white);
  }
  // Pedestrian paving joints create believable scale at street level.
  const joints = new THREE.InstancedMesh(cube, new THREE.MeshStandardMaterial({ color: 0x6c6b63, roughness: 1 }), 150);
  const matrix = new THREE.Matrix4(); const position = new THREE.Vector3(); const rotation = new THREE.Quaternion();
  const stamp = (mesh: THREE.InstancedMesh, i: number, x: number, y: number, z: number, w: number, h: number, d: number) => {
    matrix.compose(position.set(x,y,z), rotation, new THREE.Vector3(w,h,d)); mesh.setMatrixAt(i,matrix);
  };
  for (let i = 0; i < 150; i++) stamp(joints, i, 0, 0.071, -145 + i * 1.6, 15, 0.006, 0.018);
  city.add(joints);

  const frames: [number,number,number,number,number,number][] = [];
  const panes: [number,number,number,number,number,number,boolean][] = [];
  for (const side of [-1, 1]) {
    for (let block = 0; block < 9; block++) {
      const z = 30 - block * 21;
      const height = 19 + ((block * 7 + (side + 1) * 3) % 8) * 4;
      const x = side * 27;
      add(x, height/2, z, 17, height, 18, block % 3 === 0 ? concrete : metal);
      add(x, 2, z, 17.6, 4, 18.5, metal);
      add(x, height + .25, z, 18, .5, 19, concrete);
      add(x + side * 2, height + 1, z - 4, 5, 1.5, 4, metal);
      // Facade facing the boulevard: recessed glazing, horizontal slabs and mullions.
      const faceX = side * 18.35;
      for (let floor = 1; floor < Math.floor(height/3.2); floor++) {
        const y = floor * 3.2 + 1.5;
        frames.push([faceX, floor*3.2, z, .35,.18,18.2]);
        for (let bay = 0; bay < 6; bay++) {
          const bz = z - 7.5 + bay * 3;
          panes.push([faceX - side*.08,y,bz,.08,2.7,2.62,(floor+bay+block)%5===0]);
          frames.push([faceX-side*.12,y,bz-1.4,.18,3,.12]);
        }
      }
      // Shop windows and a deep canopy at human scale.
      add(side*17.7, 3.65, z, 2.5,.18,18.4,metal);
      for (let bay = 0; bay < 5; bay++) {
        add(side*18.25, 1.7, z-6.8+bay*3.4, .08,2.8,3,glass);
      }
      add(side*17.9, 3.1, z, .12,.28,9,lit);
    }
  }
  const facadeFrames = new THREE.InstancedMesh(cube, metal, frames.length);
  frames.forEach((f,i)=>stamp(facadeFrames,i,...f)); city.add(facadeFrames);
  const glazing = new THREE.InstancedMesh(cube, glass, panes.length);
  const glow = new THREE.InstancedMesh(cube, lit, panes.filter(p=>p[6]).length);
  let glowIndex=0;
  panes.forEach((p,i)=>{stamp(glazing,i,p[0],p[1],p[2],p[3],p[4],p[5]);if(p[6]) stamp(glow,glowIndex++,p[0]-Math.sign(p[0])*.01,p[1],p[2],p[3],p[4],p[5]);});
  city.add(glazing,glow);
  // Landmark at the vanishing point: stepped modern tower, not a cartoon prop.
  for(let tier=0;tier<5;tier++) {
    const width=25-tier*3;
    add(0,15+tier*12,-156,width,12,width,glass);
    add(0,21+tier*12,-156,width+.4,.3,width+.4,metal);
  }
  // Repeat furniture, planters and warm lamps along both sidewalks.
  const leaves = new THREE.MeshStandardMaterial({color:0x354638,roughness:.95});
  const bark = new THREE.MeshStandardMaterial({color:0x5b4a3a,roughness:1});
  const foliage = new THREE.IcosahedronGeometry(1,2);
  const trunk = new THREE.CylinderGeometry(.1,.18,3.6,7);
  for (const side of [-1,1]) for (let i=0;i<10;i++) {
    const z=25-i*16;
    add(side*14.5,.3,z,2.2,.6,3,concrete);
    const tree=new THREE.Mesh(trunk,bark);tree.position.set(side*14.5,2.1,z);tree.castShadow=true;city.add(tree);
    for(let crown=0;crown<3;crown++) {
      const leaf=new THREE.Mesh(foliage,leaves);leaf.scale.set(1.8,2.3,1.8);leaf.position.set(side*14.5+(crown-1)*.6,4.7+crown*.35,z);leaf.castShadow=true;city.add(leaf);
    }
    add(side*7.9,2.6,z-6,.1,5.2,.1,metal);
    add(side*7.5,5.2,z-6,.9,.1,.25,metal);
    add(side*7.5,5.13,z-6,.65,.04,.18,lit);
    // Limited actual lights; emissive fixtures handle the rest.
    if(i<2) {const light=new THREE.PointLight(0xffd5a0,5,12,2);light.position.set(side*7.5,4.8,z-6);city.add(light);}
    add(side*13, .55,z+4,.65,.15,2.8,bark);
    for(const dz of [-1,1]) add(side*13,.28,z+4+dz,.5,.5,.12,metal);
  }
  for(let stripe=0;stripe<12;stripe++) add(-12+stripe*2.2,.02,39,1.15,.03,4,white);
  return city;
}
