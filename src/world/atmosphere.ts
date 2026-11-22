import * as THREE from "three";

export interface AtmosphereRig {
  skyMesh: THREE.Mesh;
  sunLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  rimLight: THREE.DirectionalLight;
  dispose: () => void;
}

/**
 * 电影级“黄金暮色 × 东方云海”自定义着色器苍穹与三点布光系统
 * 避免默认 Sky 过曝泛白，呈现深邃靛蓝天顶 → 暖杏霞光地平线 → 柔金日轮光晕
 */
export function createSkyAtmosphere(scene: THREE.Scene): AtmosphereRig {
  const skyGeo = new THREE.SphereGeometry(1400, 40, 24);
  const sunDir = new THREE.Vector3(-0.48, 0.24, -0.84).normalize();

  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uSunDir: { value: sunDir },
      uZenithColor: { value: new THREE.Color("#0e1c3a") },
      uMidColor: { value: new THREE.Color("#2a4d7d") },
      uHorizonColor: { value: new THREE.Color("#f0a875") },
      uCloudFloorColor: { value: new THREE.Color("#1a2744") },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldDir;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uSunDir;
      uniform vec3 uZenithColor;
      uniform vec3 uMidColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uCloudFloorColor;
      varying vec3 vWorldDir;

      void main() {
        vec3 dir = normalize(vWorldDir);
        float h = dir.y;

        vec3 col;
        if (h >= 0.0) {
          float t1 = smoothstep(0.0, 0.24, h);
          float t2 = smoothstep(0.20, 0.82, h);
          col = mix(uHorizonColor, uMidColor, t1);
          col = mix(col, uZenithColor, t2);
        } else {
          float tb = smoothstep(0.0, -0.38, h);
          col = mix(uHorizonColor, uCloudFloorColor, tb);
        }

        // 日轮与周围大气散射金晕
        float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);
        float halo = pow(sunDot, 10.0) * 0.42;
        float core = pow(sunDot, 220.0) * 1.45;
        col += vec3(1.0, 0.78, 0.52) * halo + vec3(1.0, 0.94, 0.82) * core;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyMesh);

  // 柔和蓝紫-暖金氛围雾，营造浮空群山空气透视
  scene.fog = new THREE.FogExp2("#384c73", 0.00185);

  // 主光：低角度黄金暖阳
  const sunLight = new THREE.DirectionalLight(0xffcf96, 2.8);
  sunLight.position.copy(sunDir).multiplyScalar(320);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 20;
  sunLight.shadow.camera.far = 650;
  sunLight.shadow.camera.left = -160;
  sunLight.shadow.camera.right = 160;
  sunLight.shadow.camera.top = 160;
  sunLight.shadow.camera.bottom = -160;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // 环境半球光：天顶冷青蓝 + 下方云海暖紫反射
  const hemiLight = new THREE.HemisphereLight(0x8bb8e8, 0x42355c, 1.15);
  scene.add(hemiLight);

  // 轮廓补光：青色背光勾勒悬崖与飞檐边缘
  const rimLight = new THREE.DirectionalLight(0x6ecbff, 0.95);
  rimLight.position.set(180, 90, 210);
  scene.add(rimLight);

  return {
    skyMesh,
    sunLight,
    hemiLight,
    rimLight,
    dispose: () => {
      skyGeo.dispose();
      skyMat.dispose();
    },
  };
}
