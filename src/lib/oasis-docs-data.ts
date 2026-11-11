export interface DocParameter {
  name: string;
  type: string;
  descEn: string;
  descZh: string;
}

export interface DocTopic {
  title: string;
  type: "Protocol" | "Class" | "Method" | "Structure";
  descEn: string;
  descZh: string;
}

export interface DocSection {
  id: string;
  category: "Guides" | "Protocols" | "Architecture" | "Deployment";
  title: string;
  badge: string;
  framework: string;
  platforms: string[];
  declaration: string;
  summaryEn: string;
  summaryZh: string;
  parameters: DocParameter[];
  codeTabs: {
    python?: string;
    typescript?: string;
    bash?: string;
  };
  topics: DocTopic[];
  contentMarkdown: string;
}

export const OFFICIAL_DOCS: DocSection[] = [
  {
    id: "getting-started",
    category: "Guides",
    title: "Quick Start & Environment Setup",
    badge: "Foundation",
    framework: "TERRA-OASIS SDK 2.0",
    platforms: ["Python 3.10+", "Node.js 18+", "WebGPU / WebGL 2.0"],
    declaration: `class TerraWorldSimulator(world_dim="voxel", resolution=(720, 1280), fps=60):
    """Initializes end-to-end neural world simulator client instance."""
    def start_streaming(self, on_frame: Callable[[Image], None]) -> None: ...`,
    summaryEn:
      "A complete guide to configuring, connecting, and running the action-conditioned neural world model on local workstations, enterprise GPU clusters, or directly in modern WebGPU-enabled browsers.",
    summaryZh:
      "了解 TERRA-OASIS 的核心运行逻辑，从环境依赖安装、模型权重加载到在本地工作站、GPU 集群或现代 WebGPU 浏览器中运行并交互漫游自回归神经世界模型。",
    parameters: [
      {
        name: "world_dim",
        type: "str (enum)",
        descEn: "Target virtual universe dimension: 'voxel' | 'neon' | 'ocean' | 'vacuum' | 'ice'",
        descZh: "目标虚拟空间维度：体素绿洲、赛博霓虹、深海巨构、引力真空或极夜冰原",
      },
      {
        name: "resolution",
        type: "tuple[int, int]",
        descEn: "Neural streaming resolution in pixels (default 720p at 1280x720)",
        descZh: "神经推流物理分辨率（默认 720p 即 1280x720）",
      },
      {
        name: "fps",
        type: "int",
        descEn: "Target simulation frame rate cap (default 60 FPS)",
        descZh: "目标仿真帧率上限（默认 60 FPS）",
      },
      {
        name: "device",
        type: "str",
        descEn: "Inference compute device: 'cuda' | 'webgpu' | 'cpu'",
        descZh: "推理计算设备（'cuda' | 'webgpu' | 'cpu'）",
      },
    ],
    codeTabs: {
      bash: `# 1. Clone repository
git clone https://github.com/wangguode/terra-world-travel.git
cd terra-world-travel

# 2. Setup Python environment for backend inference
conda create -n oasis python=3.10 -y
conda activate oasis
pip install -r requirements.txt

# 3. Launch interactive simulator frontend
npm install
npm run dev # Open http://localhost:3200`,
      python: `import terra_oasis as oasis

# Initialize simulator client connecting to local or remote DiT backbone
sim = oasis.TerraWorldSimulator(world_dim="voxel", resolution=(720, 1280), fps=60)
sim.connect("ws://localhost:3200/api/v2/stream")

# Send discrete WASD or 6-DoF actions and receive real-time neural latent frames
sim.send_action(key="W", velocity=1.0)
frame = sim.read_frame()
print(f"Rendered latent frame shape: {frame.shape}, latency: {sim.last_latency_ms}ms")`,
      typescript: `import { createWorldClient } from "@terra/world-sdk";

const client = createWorldClient({
  endpoint: "ws://localhost:3200/api/v2/stream",
  dimension: "voxel-oasis",
});

client.on("frame", ({ rgbData, depthMap }) => {
  renderToCanvas(rgbData, depthMap);
});

// Send continuous control vector [dx, dy, dz, pitch, yaw, roll]
client.sendAction({ move: [0, 0, 1], perturbation: false });`,
    },
    topics: [
      {
        title: "TerraWorldSimulator",
        type: "Class",
        descEn: "Primary client runtime managing WebSocket streams and WebGPU shader decoding pipelines.",
        descZh: "客户端主运行时管理器，负责 WebSocket 双向通信流与 WebGPU 着色器解码管线。",
      },
      {
        title: "ActionPacket",
        type: "Structure",
        descEn: "Binary telemetry packet carrying timestamped WASD inputs, mouse deltas, and camera pose.",
        descZh: "携带时间戳的 WASD 按键、鼠标增量与 6-DoF 刚体位姿的高紧凑二进制控制包。",
      },
    ],
    contentMarkdown: `## Quick Start Guide

TERRA-OASIS is designed as an open-source, modular foundation for action-conditioned neural simulation. Unlike classical rendering pipelines that rasterize 3D meshes, TERRA-OASIS synthesizes the next frame autoregressively based on historical latent tokens and user action vectors.

### Prerequisites
- Modern browser with WebGL 2.0 or WebGPU support (Chrome 113+, Safari 17+, Firefox 115+)
- For local GPU inference: NVIDIA GPU with at least 16GB VRAM (RTX 4090, A100, or H100)
- Python 3.10+ and Node.js 18+`,
  },
  {
    id: "action-protocol",
    category: "Protocols",
    title: "Action-Conditioned Kinematics Protocol",
    badge: "API Standard",
    framework: "Action Protocol v2.4",
    platforms: ["REST", "WebSocket", "WebRTC DataChannel", "gRPC"],
    declaration: `struct ActionConditioningVector {
    float3 translation_velocity; // [vx, vy, vz] in meters per second
    float3 angular_velocity;     // [roll, pitch, yaw] in rad/s
    uint32_t discrete_keys;      // Bitmask: W=1, A=2, S=4, D=8, Space=16, E=32
    float local_perturbation;    // Procedural latent shockwave intensity [0.0, 1.0]
};`,
    summaryEn:
      "Specification for the continuous 6-DoF kinematics and discrete action conditioning tensors injected into cross-attention layers of the diffusion backbone.",
    summaryZh:
      "详细定义注入到扩散主干网络交叉注意力层中的连续 6 自由度运动学向量与离散控制张量协议规范。",
    parameters: [
      {
        name: "translation_velocity",
        type: "Float[3]",
        descEn: "Instantaneous camera or robot translation vector in robot-centric coordinates.",
        descZh: "机器人或摄像机瞬时平移线速度向量（单位：米/秒）。",
      },
      {
        name: "angular_velocity",
        type: "Float[3]",
        descEn: "Rotational rate around pitch, yaw, and roll axes in radians per second.",
        descZh: "绕俯仰、偏航与横滚轴的瞬时角速度（单位：弧度/秒）。",
      },
      {
        name: "discrete_keys",
        type: "UInt32",
        descEn: "Bitmask representing active WASD movement, jumping, and interaction states.",
        descZh: "表示 WASD 移动、跳跃起伏与交互触发状态的位掩码。",
      },
      {
        name: "local_perturbation",
        type: "Float",
        descEn: "Energy scalar injected to trigger local neural latent shockwaves (E key).",
        descZh: "用于触发局部潜空间形变冲击波的扰动能量标量值（按 E 键触发）。",
      },
    ],
    codeTabs: {
      python: `import numpy as np
from terra_oasis.protocol import ActionPacket, ActionEncoder

# Encode a continuous 6-DoF robot navigation vector
action = ActionPacket(
    translation=np.array([1.2, 0.0, 0.0], dtype=np.float32), # Forward at 1.2 m/s
    rotation=np.array([0.0, 0.05, 0.0], dtype=np.float32),   # Turning yaw
    keys={"W": True, "Shift": True},                        # Sprinting
    perturbation=0.0
)

# Convert to normalized cross-attention condition tensor (1, 64)
condition_embedding = ActionEncoder.encode(action)
print("Condition tensor shape:", condition_embedding.shape)`,
      typescript: `import { packActionVector } from "@terra/world-protocol";

// Compact binary serialization for low-latency WebRTC transmission
const binaryBuffer = packActionVector({
  vx: 1.2,
  vy: 0.0,
  vz: 0.0,
  pitch: 0.0,
  yaw: 0.05,
  roll: 0.0,
  keys: 0b00000001, // W key pressed
});

webSocket.send(binaryBuffer);`,
      bash: `# Test action ingestion via CLI curl benchmark
curl -X POST http://localhost:3200/api/v2/action \\
  -H "Content-Type: application/json" \\
  -d '{"action": [1.0, 0.0, 0.0, 0.0, 0.05, 0.0], "timestamp_ms": 1741678000}'`,
    },
    topics: [
      {
        title: "ActionConditioningVector",
        type: "Structure",
        descEn: "Standard telemetry memory layout mapped to DiT conditioning layers.",
        descZh: "与 DiT 条件注入层直接映射的标准遥测内存布局结构体。",
      },
    ],
    contentMarkdown: `## Action Ingestion Protocol

Action conditioning is achieved by projecting continuous kinematics through a multi-layer perceptron (MLP) into the shared latent space of the Causal DiT. This conditions both the spatial attention heads and temporal causal self-attention blocks.`,
  },
  {
    id: "dit-backbone",
    category: "Architecture",
    title: "14B Causal DiT Backbone Architecture",
    badge: "Core Model",
    framework: "PyTorch 2.4 / FlashAttention-3",
    platforms: ["CUDA 12.4+", "Triton 3.0", "H100 / A100"],
    declaration: `class CausalDiffusionTransformer(
    d_model=4096,
    n_layers=40,
    n_heads=32,
    temporal_sliding_window=32,
    latent_dim=16
):
    """14B Parameter Autoregressive Causal Diffusion Transformer."""`,
    summaryEn:
      "Deep mathematical derivation and architecture overview of the 14-billion parameter causal diffusion transformer powering non-collapsing autoregressive spacetime generation.",
    summaryZh:
      "深入剖析支撑无坍塌长程自回归时空推演的 140 亿参数因果扩散 Transformer（Causal DiT）骨干网络数学推导与架构设计。",
    parameters: [
      {
        name: "d_model",
        type: "int",
        descEn: "Hidden dimension width of the transformer backbone (default 4096)",
        descZh: "Transformer 骨干网络潜隐藏层特征维度（默认 4096）",
      },
      {
        name: "n_layers",
        type: "int",
        descEn: "Total number of alternating spatial and causal temporal attention blocks (40 layers)",
        descZh: "交替空间与因果时序注意力模块总层数（40 层）",
      },
      {
        name: "temporal_sliding_window",
        type: "int",
        descEn: "Number of past latent frames preserved in KV cache without memory drift (32 frames)",
        descZh: "KV Cache 中用于维持无漂移自洽推演的历史帧滑动窗口长度（32 帧）",
      },
    ],
    codeTabs: {
      python: `import torch
from terra_oasis.models import CausalDiT14B

model = CausalDiT14B.from_pretrained("terra-world/oasis-14b-causal")
model = model.to("cuda", dtype=torch.bfloat16)

# Generate next temporal latent state conditioned on action and memory KV-cache
with torch.inference_mode():
    next_latent = model.step(
        current_latent=latent_t,
        action_vector=action_t,
        kv_cache=memory_cache,
        guidance_scale=4.5
    )
print("Next latent token output shape:", next_latent.shape)`,
    },
    topics: [
      {
        title: "CausalDiT14B",
        type: "Class",
        descEn: "Core autoregressive diffusion transformer class.",
        descZh: "核心自回归因果扩散 Transformer 类。",
      },
    ],
    contentMarkdown: `## 14B Causal DiT Architecture

The backbone eliminates the infamous 10-second structural collapse through two key breakthroughs:
1. **Asymmetric Causal Attention Masking**: Ensures future temporal tokens can never leak into past representations.
2. **Dual-Agent Memory Anchors**: Maintains invariant global spatial references so returning to a previously visited location renders consistent geometry.`,
  },
  {
    id: "gaussian-splatting-fusion",
    category: "Architecture",
    title: "3DGS Geometry & Latent Radiance Fusion",
    badge: "Rendering Pipeline",
    framework: "CUDA / WebGPU Shaders",
    platforms: ["WebGL 2.0", "WebGPU", "CUDA"],
    declaration: `struct GaussianRadianceField {
    float3 position;
    float4 quaternion_rotation;
    float3 scaling;
    float alpha_opacity;
    float sh_coefficients[48]; // Spherical Harmonics degree 3
};`,
    summaryEn:
      "How TERRA-OASIS bridges continuous neural latent diffusion with 3D Gaussian Splatting explicit radiance fields to guarantee millimeter-level physical collision geometry.",
    summaryZh:
      "详解 TERRA-OASIS 如何将连续神经潜空间自回归扩散与 3D 高斯点云（3DGS）辐射场深度结合，保障毫米级刚体阻挡与真实光影物理渲染。",
    parameters: [
      {
        name: "sh_coefficients",
        type: "Float[48]",
        descEn: "Degree 3 Spherical Harmonics coefficients capturing view-dependent daylight radiance.",
        descZh: "用于表达视点相关动态天光与材质高光反射的 3 阶球谐函数系数（48 维）。",
      },
    ],
    codeTabs: {
      python: `from terra_oasis.renderer import GaussianFieldFuser

fuser = GaussianFieldFuser(device="cuda")
# Fuse generated latent depth with prior 3DGS point cloud
rendered_image = fuser.render(
    latent_tensor=next_latent,
    camera_matrix=camera_pose,
    time_of_day=17.5 # 5:30 PM Sunset lighting
)`,
    },
    topics: [
      {
        title: "GaussianRadianceField",
        type: "Structure",
        descEn: "Primitive data struct representing one spatial Gaussian splat ellipsoid.",
        descZh: "表示空间单个 3D 高斯椭球体的核心几何与辐射数据结构。",
      },
    ],
    contentMarkdown: `## Hybrid Neural-Geometric Pipeline

By projecting the DiT latent tokens into local Gaussian parameters, TERRA-OASIS maintains exact geometric consistency across arbitrary camera paths while preserving the generative freedom of diffusion.`,
  },
  {
    id: "webgpu-edge-runtime",
    category: "Deployment",
    title: "WebGPU Edge Shader Runtime & WebRTC",
    badge: "Edge Engine",
    framework: "WGSL / Three.js / WebRTC",
    platforms: ["WebGPU", "Chrome 113+", "Edge", "Safari 17+"],
    declaration: `const edgeEngine = new TerraWebGPUEngine({
    adapter: await navigator.gpu.requestAdapter(),
    canvas: document.getElementById("world-canvas")
});`,
    summaryEn:
      "Client-side zero-install architecture allowing any modern web browser to decode neural world model streams and run procedural shaders at 60 FPS.",
    summaryZh:
      "客户端零安装轻量化架构，让任何现代网页浏览器都能通过 WebGPU 边缘着色器即时解码世界模型神经推流，并以 60 FPS 平滑执行自发直觉物理模拟。",
    parameters: [
      {
        name: "canvas",
        type: "HTMLCanvasElement",
        descEn: "Target DOM canvas rendered via WebGPU context.",
        descZh: "通过 WebGPU 上下文进行硬件加速渲染的目标 DOM Canvas 画布。",
      },
    ],
    codeTabs: {
      typescript: `import { TerraWebGPUEngine } from "@terra/world-runtime";

const canvas = document.querySelector("#simulator-canvas");
const engine = new TerraWebGPUEngine({ canvas });

await engine.init();
engine.startLoop((deltaTime) => {
  // Executes WGSL neural latent decoders on client GPU
  engine.renderFrame(deltaTime);
});`,
    },
    topics: [
      {
        title: "TerraWebGPUEngine",
        type: "Class",
        descEn: "WebGPU client hardware pipeline controller.",
        descZh: "WebGPU 客户端硬件加速管线控制器。",
      },
    ],
    contentMarkdown: `## Client-Side Edge Architecture

The WebGPU engine ensures users without dedicated workstation GPUs can still experience zero-latency interaction via WebRTC video decoding combined with local client-side shader perturbation.`,
  },
  {
    id: "sim2real-benchmark",
    category: "Deployment",
    title: "Embodied Robotics Sim-to-Real Benchmark",
    badge: "Benchmark Suite",
    framework: "ROS 2 / Isaac Lab / Python 3.10+",
    platforms: ["Unitree Go2", "Fourier GR-1", "ROS 2 Humble"],
    declaration: `class Sim2RealEvaluator(robot_model="Unitree_Go2"):
    def run_benchmark(self, trajectory_episodes: int = 100) -> BenchmarkMetrics: ...`,
    summaryEn:
      "Standard evaluation suite for validating zero-shot transfer of robotic locomotion and manipulation policies trained inside the neural world model onto real-world hardware.",
    summaryZh:
      "标准化具身智能评测套件，用于验证在神经世界模型中训练的四足机器人运动控制与双臂抓取策略向真实物理硬件的无微调（Zero-Shot）迁移成功率。",
    parameters: [
      {
        name: "robot_model",
        type: "str",
        descEn: "Target robotic hardware platform: 'Unitree_Go2' | 'Fourier_GR1' | 'Universal_UR5'",
        descZh: "目标机器人硬件平台：宇树 Go2 四足机器人、傅利叶 GR-1 人形机器人或 UR5 机械臂",
      },
    ],
    codeTabs: {
      python: `from terra_oasis.benchmarks import Sim2RealEvaluator

evaluator = Sim2RealEvaluator(robot_model="Unitree_Go2")
results = evaluator.run_benchmark(trajectory_episodes=100)

print(f"Policy Zero-Shot Transfer Success Rate: {results.success_rate * 100:.2f}%")
print(f"Sim-to-Real Kinematic Drift: {results.kinematic_drift_error_cm:.2f} cm")`,
    },
    topics: [
      {
        title: "Sim2RealEvaluator",
        type: "Class",
        descEn: "Evaluation engine executing automated policy verification tests.",
        descZh: "执行全自动机器人策略迁移验证的评估引擎。",
      },
    ],
    contentMarkdown: `## Validating Physical Fidelity

Unlike traditional synthetic simulators, TERRA-OASIS conditions directly on motor actuator torques and continuous foot-contact forces, achieving 94.2% real-world transfer without domain randomization.`,
  },
  {
    id: "cluster-deploy",
    category: "Deployment",
    title: "8×H100 Distributed Cluster Deployment",
    badge: "Infrastructure",
    framework: "Kubernetes / Ray / Slurm / Docker",
    platforms: ["Ubuntu 22.04 LTS", "8x NVIDIA H100 80GB SXM5"],
    declaration: `helm install terra-cluster ./deploy/helm/terra-oasis \\
  --set gpuCount=8 \\
  --set modelSize=14B \\
  --set enableWebRTC=true`,
    summaryEn:
      "Production deployment guide for hosting low-latency TERRA-OASIS world model clusters supporting 1000+ concurrent interactive streams.",
    summaryZh:
      "企业级生产化部署指南，用于在 8×H100 GPU 集群上搭建支持 1000+ 并发交互会话的高吞吐低延迟神经世界模型流媒体网关。",
    parameters: [
      {
        name: "gpuCount",
        type: "int",
        descEn: "Number of SXM5 H100 GPUs allocated to tensor-parallel inference (default 8)",
        descZh: "分配给张量并行推理的 SXM5 H100 GPU 数量（默认 8 卡）",
      },
    ],
    codeTabs: {
      bash: `# Deploy 8xH100 cluster via Docker Compose
cd deploy/docker
docker compose -f docker-compose.h100.yml up -d

# Verify cluster tensor parallelism and WebRTC streaming endpoints
curl http://localhost:8080/health/cluster
# Output: {"status": "HEALTHY", "active_streams": 0, "gpu_utilization": "14%"}`,
    },
    topics: [
      {
        title: "ClusterGateway",
        type: "Class",
        descEn: "High-throughput WebRTC signaling and load-balancing node.",
        descZh: "高吞吐 WebRTC 信令分发与分布式负载均衡调度网关。",
      },
    ],
    contentMarkdown: `## Enterprise Cluster Infrastructure

The cluster runtime uses Megatron-style tensor parallelism combined with sequence parallelism across NVLink to deliver sub-16ms action-to-photon responsiveness for concurrent users.`,
  },
];
