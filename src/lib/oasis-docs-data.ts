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
  summary?: string;
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
    title: "Getting Started with TERRA-OASIS",
    badge: "Foundation",
    framework: "TERRA-OASIS SDK 2.0",
    platforms: ["WebGL 2.0", "Node.js 18+", "Python 3.10+"],
    declaration: `class TerraWorldSimulator(world_dim="voxel", resolution=(720, 1280), fps=60):
    """Initializes end-to-end neural world simulator client instance."""
    def start_streaming(self, on_frame: Callable[[Image], None]) -> None: ...`,
    summaryEn:
      "A complete guide to configuring, connecting, and roaming the neural world model on local machines or inside modern browsers without external graphic dependencies.",
    summaryZh:
      "了解 TERRA-OASIS 的核心运行逻辑，从零在本地环境或现代浏览器中启动并交互漫游自回归神经世界模型。",
    parameters: [
      {
        name: "world_dim",
        type: "str (enum)",
        descEn: "Target virtual universe dimension: 'voxel' | 'neon' | 'ocean' | 'vacuum' | 'ice'",
        descZh: "目标虚拟维度环境：体素绿洲、赛博霓虹、深海沉没巨构、引力真空孤岛或极夜冰原",
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
        descEn: "Client presentation frame rate cap (default 60)",
        descZh: "客户端呈现帧率上限（默认 60 FPS）",
      },
    ],
    codeTabs: {
      bash: `# Clone official open source repo
git clone https://github.com/wangguode/terra-world-travel.git
cd terra-world-travel

# Install dependencies and boot simulator
npm install
npm run dev # Open http://localhost:3200`,
      python: `import terra_oasis as oasis

# Connect to cloud or local world inference pipeline
sim = oasis.TerraWorldSimulator(world_dim="voxel", fps=60)
sim.connect("wss://api.terra.ai/v2/stream")

# Send discrete WASD actions and receive continuous neural video frames
sim.send_action(key="W", velocity=1.0)
frame = sim.read_frame()`,
      typescript: `import { createWorldClient } from "@terra/world-sdk";

const client = createWorldClient({
  endpoint: "wss://api.terra.ai/v2/stream",
  dimension: "voxel-oasis",
});

client.on("frame", ({ rgbData, depthMap }) => {
  renderToCanvas(rgbData, depthMap);
});
client.sendAction({ move: [0, 0, 1], perturbation: false });`,
    },
    topics: [
      {
        title: "Architecture Topology",
        type: "Structure",
        descEn: "Hybrid cloud-inference and edge WebGL lightweight rasterization pipeline.",
        descZh: "云端因果扩散推理管线与边缘 WebGL 轻量光栅化的混合拓扑。",
      },
      {
        title: "Action Conditioning Latents",
        type: "Protocol",
        descEn: "Translating human keyboard inputs into continuous manifold conditions.",
        descZh: "将键盘 WASD 输入连续映射为高维物理流形潜变量。",
      },
    ],
    contentMarkdown: `### 1. System Overview

TERRA-OASIS completely eliminates manual polygon authoring, skeletal rigs, and hardcoded physics solvers. Every rendered pixel is predicted on-the-fly by an autoregressive Causal DiT:
- **Zero Polygonal Meshes**: No OBJ/FBX vertex buffers or UV unwraps.
- **Action-Conditioned Generation**: Keyboard WASD keystrokes act as continuous conditions steering latent state transitions.
- **Universal Browser Compatibility**: 60 FPS WebGL streaming without discrete GPUs.`,
  },
  {
    id: "action-protocol",
    category: "Protocols",
    title: "Action Streaming Protocol Specification",
    badge: "Core API",
    framework: "RFC-2603 ActionStream",
    platforms: ["WebSocket", "WebRTC DataChannel", "gRPC-Web"],
    declaration: `interface ActionFramePayload {
  sessionToken: string;
  sequenceId: number;
  action: {
    moveVector: [number, number, number];
    lookDelta: [number, number];
    perturbation: boolean;
    reseed: boolean;
  };
}`,
    summaryEn:
      "Defines the low-latency bidirectional binary frame structure between interactive clients and world model inference servers.",
    summaryZh:
      "详解客户端与模型服务端之间的低延迟全双工 WebSocket 动作通信格式与高维张量映射规范。",
    parameters: [
      {
        name: "moveVector",
        type: "float32[3]",
        descEn: "Normalized 3D displacement vector [dx, dy, dz] within range [-1.0, 1.0]",
        descZh: "归一化 3D 位移矢量 [dx, dy, dz]，取值区间为 [-1.0, 1.0]",
      },
      {
        name: "lookDelta",
        type: "float32[2]",
        descEn: "Euler rotation delta [delta_yaw, delta_pitch] in radians",
        descZh: "摄像机欧拉角增量 [偏航角, 俯仰角]，以弧度为单位",
      },
      {
        name: "perturbation",
        type: "boolean",
        descEn: "E-key trigger flag for injecting local Gaussian shockwaves into latent voxel space",
        descZh: "E 键破拆触发标识，用于在潜空间局部注入高斯冲击波",
      },
      {
        name: "reseed",
        type: "boolean",
        descEn: "R-key request for sampling a new random seed vector",
        descZh: "R 键量子重采样请求，用于在保持宏观世界拓扑的前提下更换随机种子",
      },
    ],
    codeTabs: {
      python: `import json, websockets

async def send_action_packet(ws, seq_id, move_vec, perturb=False):
    payload = {
        "sequenceId": seq_id,
        "action": {
            "moveVector": move_vec,
            "lookDelta": [0.0, 0.0],
            "perturbation": perturb,
            "reseed": False
        }
    }
    await ws.send(json.dumps(payload))`,
      typescript: `const socket = new WebSocket("wss://api.terra.ai/v2/stream");

function pushAction(move: [number, number, number], perturb = false) {
  socket.send(JSON.stringify({
    sequenceId: performance.now(),
    action: {
      moveVector: move,
      lookDelta: [0, 0],
      perturbation: perturb,
      reseed: false
    }
  }));
}`,
      bash: `curl -N -H "Upgrade: websocket" \\
     -H "Connection: Upgrade" \\
     https://api.terra.ai/v2/stream`,
    },
    topics: [
      {
        title: "Latency Optimization",
        type: "Method",
        descEn: "Techniques for achieving sub-16ms end-to-end action injection pipeline.",
        descZh: "实现 16ms 以内端到端动作条件注入延迟的优化方法。",
      },
      {
        title: "Frame Acknowledgement",
        type: "Protocol",
        descEn: "Server-side feedback tokens and drift compensation timestamps.",
        descZh: "服务端应答回执与时空漂移补偿机制。",
      },
    ],
    contentMarkdown: `### 1. Packet Frequency & Time Budget

Actions must be dispatched at 60Hz. The model maintains a ring-buffer of the latest 32 frames of actions, ensuring smooth acceleration curves and realistic inertia without manual easing scripts.`,
  },
  {
    id: "dit-backbone",
    category: "Architecture",
    title: "14B Causal DiT Horizon Architecture",
    badge: "Core Model",
    framework: "PyTorch 2.4+ / CUDA 12.4",
    platforms: ["NVIDIA H100", "A100 SXM", "Blackwell B200"],
    declaration: `class CausalDiffusionTransformer(nn.Module):
    def __init__(self, d_model=4096, n_heads=32, n_layers=48, causal_window=32):
        super().__init__()
        self.temporal_sliding_attn = SlidingCausalAttention(causal_window)
        self.spatial_cross_attn = ActionCrossAttention(d_model)`,
    summaryEn:
      "Deep dive into temporal sliding attention, KV-cache sliding horizons, and structural drift prevention across infinite autoregressive roaming.",
    summaryZh:
      "深入解构因果扩散 Transformer 骨干、时序滑动注意力机制与无限长程漫游抗画面崩塌策略。",
    parameters: [
      {
        name: "d_model",
        type: "int",
        descEn: "Hidden latent representation dimension (4096 for 14B model)",
        descZh: "隐空间特征维度大小（14B 旗舰模型为 4096）",
      },
      {
        name: "n_layers",
        type: "int",
        descEn: "Total number of causal Transformer blocks (48 blocks)",
        descZh: "因果 Transformer 堆叠层数（48 层）",
      },
      {
        name: "causal_window",
        type: "int",
        descEn: "Sliding context window length for temporal attention key-value cache (32 frames)",
        descZh: "时序滑动注意力 Key-Value 缓存窗口长度（32 帧）",
      },
    ],
    codeTabs: {
      python: `import torch
from terra_model import CausalDiT

model = CausalDiT.from_pretrained("terra-oasis/14b-causal").cuda().bfloat16()

# Forward single step with action conditioning
action_latent = torch.randn(1, 16, device="cuda", dtype=torch.bfloat16)
past_kv = model.init_cache(batch_size=1)

with torch.inference_mode():
    next_latents, past_kv = model(action_latent, past_kv=past_kv)`,
      typescript: `// Client-side inference interface via WebGPU
import { runWebGPUDiT } from "@terra/webgpu-runtime";

const nextFrame = await runWebGPUDiT({
  actionVector: [0, 0, 1],
  contextId: activeSession.id
});`,
      bash: `# Download weights from HuggingFace
git lfs install
git clone https://huggingface.co/terra-world-lab/terra-oasis-14b`,
    },
    topics: [
      {
        title: "KV-Cache Management",
        type: "Method",
        descEn: "Maintaining temporal continuity with constant memory footprints.",
        descZh: "通过常量显存占用维持无限时间跨度的因果连贯性。",
      },
      {
        title: "Energy Renormalization",
        type: "Class",
        descEn: "Preventing latent white-out and spatial geometry collapse.",
        descZh: "抑制自回归长期累积误差引起的潜空间泛白与拓扑坍塌。",
      },
    ],
    contentMarkdown: `### 1. Dual-Agent Director Architecture

To prevent video decay beyond 10 seconds, TERRA-OASIS deploys a Pilot Agent for micro-motion response and a Director Agent for global scene consistency, yielding rock-solid landscapes over multi-hour sessions.`,
  },
  {
    id: "cluster-deploy",
    category: "Deployment",
    title: "Enterprise Multi-Node Cluster Deployment",
    badge: "Operations",
    framework: "Docker / Kubernetes / vLLM-World",
    platforms: ["Ubuntu 22.04 LTS", "Kubernetes 1.28+", "vLLM-World"],
    declaration: `docker run --gpus all -d -p 8080:8080 \\
  --ipc=host \\
  ghcr.io/terra-world-lab/terra-oasis-server:2.0 \\
  --model terra-oasis/14b-causal \\
  --tensor-parallel-size 8 \\
  --enable-causal-cache`,
    summaryEn:
      "Enterprise manual for serving high-throughput 60 FPS world simulation on 8×H100/H800 clusters with Tensor Parallelism.",
    summaryZh:
      "面向大规模高并发生产环境的 8×H100/H800 集群张量并行分布式私有化部署手册。",
    parameters: [
      {
        name: "--tensor-parallel-size",
        type: "int",
        descEn: "Number of GPUs over which to shard model weights (usually 8)",
        descZh: "模型权重张量并行切分的 GPU 数量（标准集群推荐为 8）",
      },
      {
        name: "--max-concurrency",
        type: "int",
        descEn: "Maximum number of simultaneous WebGL client action streams",
        descZh: "单节点同时支持的最大并发 WebGL 动作推流会话数",
      },
    ],
    codeTabs: {
      bash: `# Launch distributed container cluster
docker compose -f deploy/docker-compose.cluster.yml up -d

# Verify cluster GPU communication
curl http://localhost:8080/v2/health`,
      python: `from terra_cluster import ClusterManager

cluster = ClusterManager(nodes=["node-01:8080", "node-02:8080"])
print("Active inference streams:", cluster.get_active_sessions())`,
      typescript: `import { HealthCheck } from "@terra/admin-client";

const status = await HealthCheck("https://cluster.internal.terra.ai");
console.log("Cluster health:", status.gpuUtilization);`,
    },
    topics: [
      {
        title: "Load Balancing",
        type: "Method",
        descEn: "Dynamic session handoff and sticky socket connections.",
        descZh: "长连接会话动态亲和性分发与故障平滑迁移。",
      },
      {
        title: "Cold-Start Warmup",
        type: "Class",
        descEn: "Pre-compiling CUDA kernels for zero-latency initial frame delivery.",
        descZh: "提前编译 CUDA 核函数实现首帧零等待投递。",
      },
    ],
    contentMarkdown: `### 1. Hardware Requirements

Recommended per node: 8× NVIDIA H100 80GB SXM5, 2TB Host Memory, 400Gbps InfiniBand NICs. Yields up to 64 concurrent 720p@60FPS playable action streams per node.`,
  },
];
