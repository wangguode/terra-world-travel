export interface WorldStudioPreset {
  id: string;
  name: string;
  category: string;
  cameraContract: "first-person" | "third-person" | "free-drone";
  basePrompt: string;
  actionHint: string;
  image: string;
  depthMap: string;
  physicsProfile: {
    gravity: string;
    friction: string;
    lighting: string;
    fps: string;
  };
}

export const STUDIO_PRESETS: WorldStudioPreset[] = [
  {
    id: "neo-dynasty",
    name: "Neo-Dynasty Imperial Sanctuary",
    category: "Architecture & Heritage",
    cameraContract: "first-person",
    basePrompt: "Vermilion palace colonnades under low golden sunset, ray-traced glazed tile reflections, deep stone corridor.",
    actionHint: "WASD to stroll through the grand gates; observe volumetric dust particles in sunset rays.",
    image: "/assets/forbidden-city.jpg",
    depthMap: "/depth/forbidden-city.png",
    physicsProfile: {
      gravity: "9.8 m/s² (Earth Normal)",
      friction: "Stone Pavement (0.65)",
      lighting: "Golden Hour 2800K",
      fps: "60 FPS (720p HD)",
    },
  },
  {
    id: "alpine-ridge",
    name: "Alpine Watchtower Precipice",
    category: "Terrestrial Landscape",
    cameraContract: "free-drone",
    basePrompt: "Winding stone fortress along craggy mountain ridge, morning fog with Mie scattering, endless horizon.",
    actionHint: "Press W to soar along the watchtower battlements; camera auto-tracks the mountain contour.",
    image: "/assets/great-wall.jpg",
    depthMap: "/depth/great-wall.png",
    physicsProfile: {
      gravity: "9.8 m/s² (Earth Normal)",
      friction: "Weathered Rock (0.72)",
      lighting: "Morning Mist 4200K",
      fps: "60 FPS (720p HD)",
    },
  },
  {
    id: "harmonic-axis",
    name: "Geometric Circular Monolith",
    category: "Sacred Geometry",
    cameraContract: "third-person",
    basePrompt: "Triple-tier marble terraces supporting circular sacred pavilion, crisp zenith contact shadows.",
    actionHint: "Orbit around the circular balustrade; inspect high-precision surface normal derivatives.",
    image: "/assets/temple-of-heaven.jpg",
    depthMap: "/depth/temple-of-heaven.png",
    physicsProfile: {
      gravity: "9.8 m/s² (Earth Normal)",
      friction: "Smooth Marble (0.45)",
      lighting: "Zenith Noon 5800K",
      fps: "60 FPS (720p HD)",
    },
  },
  {
    id: "aquatic-pavilion",
    name: "Submerged Lake & Seventeen Arches",
    category: "Fluid & Optics",
    cameraContract: "first-person",
    basePrompt: "Expansive tranquil lake reflecting evening twilight, seventeen-arch bridge with Fresnel ripples.",
    actionHint: "Glide forward towards the lake shore; observe dynamic water wavelets responding to movement.",
    image: "/assets/summer-palace.jpg",
    depthMap: "/depth/summer-palace.png",
    physicsProfile: {
      gravity: "9.8 m/s² (Earth Normal)",
      friction: "Water Surface Dynamics",
      lighting: "Blue Hour Twilight 8200K",
      fps: "60 FPS (720p HD)",
    },
  },
  {
    id: "brutalist-loft",
    name: "Industrial Sawtooth Light Chamber",
    category: "Interior Spatial",
    cameraContract: "first-person",
    basePrompt: "Spacious Bauhaus industrial hall with north-facing sawtooth skylights, cold diffuse ambient lighting.",
    actionHint: "Walk across the polished concrete floor; examine diffuse bounce light on concrete pillars.",
    image: "/assets/798.jpg",
    depthMap: "/depth/798.png",
    physicsProfile: {
      gravity: "9.8 m/s² (Earth Normal)",
      friction: "Sealed Concrete (0.55)",
      lighting: "Cold Diffuse 6200K",
      fps: "60 FPS (720p HD)",
    },
  },
];

export interface StudioDeploymentCode {
  title: string;
  language: string;
  code: string;
}

export const DEPLOYMENT_SNIPPETS: StudioDeploymentCode[] = [
  {
    title: "1. Clone & Setup Dependencies",
    language: "bash",
    code: `git clone https://github.com/Robbyant/lingbot-world-v2.git
cd lingbot-world-v2
pip install -r requirements.txt
pip install sglang --upgrade`,
  },
  {
    title: "2. Launch SGLang Distributed Model Engine",
    language: "bash",
    code: `python3 -m sglang.launch_server \\
  --model-path robbyant/lingbot-world-v2-14b-distilled \\
  --port 30000 \\
  --tp 8 \\
  --enable-causal-attention \\
  --mem-fraction-static 0.85`,
  },
  {
    title: "3. Connect Low-Latency Interactive WebSocket Stream",
    language: "typescript",
    code: `import { LingBotClient } from "@reactor/lingbot-world-sdk";

const client = new LingBotClient({
  endpoint: "wss://api.reactor.inc/v2/stream",
  sessionToken: process.env.REACTOR_SESSION_TOKEN,
});

// Stream keyboard actions at 60Hz
window.addEventListener("keydown", (e) => {
  client.sendAction({
    action: e.key.toLowerCase(), // 'w', 'a', 's', 'd', 'space'
    timestamp: performance.now(),
    cameraContract: "first-person"
  });
});`,
  },
];
