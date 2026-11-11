export interface DocSection {
  id: string;
  title: string;
  badge: string;
  summary: string;
  contentMarkdown: string;
}

export const OFFICIAL_DOCS: DocSection[] = [
  {
    id: "getting-started",
    title: "快速上手与架构概览 (Getting Started)",
    badge: "基础入门",
    summary: "了解 TERRA-OASIS 的核心运行逻辑，从零在本地环境或现代浏览器中启动交互沙盒。",
    contentMarkdown: `### 1. 系统核心原理

TERRA-OASIS 是一个由神经网络直接驱动的时空仿真引擎。它颠覆了传统 3D 渲染图形管线：
- **0 几何多边形网格**：无需手工雕刻 OBJ/FBX 顶点模型；
- **动作驱动自回归推演**：输入键盘 WASD 速度矢量与扰动操作，端到端生成下一帧连续时空与物理反馈；
- **全平台 WebGL 原生支持**：无需安装客户端，直接在现代浏览器中实现 60 FPS 流式渲染。

### 2. 极速环境启动

可以通过标准 Node.js 环境在 30 秒内启动本地交互端：

\`\`\`bash
# 克隆代码仓库
git clone https://github.com/wangguode/terra-world-travel.git
cd terra-world-travel

# 安装轻量依赖项
npm install

# 启动本地交互开发服务器
npm run dev
\`\`\`

启动完成后访问 \`http://localhost:3200\` 即可通过键盘直接漫游五大多重虚拟世界。`,
  },
  {
    id: "action-protocol",
    title: "动作条件注入协议 (Action Streaming Protocol)",
    badge: "核心协议",
    summary: "详解客户端与模型服务端之间的低延迟 WebSocket 动作通信格式与张量映射规则。",
    contentMarkdown: `### 1. 动作帧数据结构

客户端通过全双工 WebSocket 向模型推理端持续发送高频连续动作矢量（60Hz 采样）：

\`\`\`typescript
interface ActionFramePayload {
  sessionToken: string;
  timestamp: number;       // 毫秒级时间戳
  sequenceId: number;      // 动作帧自增序号
  action: {
    moveVector: [number, number, number]; // [x, y, z] 归一化移动速度
    lookDelta: [number, number];          // [yaw, pitch] 镜头旋转增量
    perturbation: boolean;                // E 键体素破拆扰动状态
    reseed: boolean;                      // R 键量子重采样请求
  };
  cameraContract: "first-person" | "free-drone" | "third-person";
}
\`\`\`

### 2. 隐空间注入延迟

从客户端按键触发到服务器完成因果 Transformer 推理并返回下一帧潜变量，整条链路耗时控制在 **16ms** 以内，满足 60 FPS 强交互体验需求。`,
  },
  {
    id: "causal-dit",
    title: "14B 因果扩散主干与时序视界 (Causal DiT)",
    badge: "网络架构",
    summary: "解构 14B Causal DiT 模型的自回归注意力机制、滑动 KV 缓存窗口与防坍塌算法。",
    contentMarkdown: `### 1. 滑动因果注意力机制 (Sliding Causal Attention)

传统视频生成模型在进行长时间推演时，往往因时间步误差累积导致画面迅速模糊崩溃。TERRA-OASIS 采用双层滑动时序视界（Sliding Horizon）：
- **局部近景因果窗 (Local Window)**：保留最近 32 帧高频动作细节，确保动作瞬时因果强响应；
- **全局拓扑锚点窗 (Global Anchors)**：每隔 128 帧提取稀疏关键隐特征，锁定场景的宏观空间结构不发生漂移。

### 2. 双智能体调度 (Pilot-Director Architecture)

系统内部运行两个微型协作智能体：
- **Pilot Agent**：专注于微观物理动力学，实时将按键矢量积分映射到相机惯性位移；
- **Director Agent**：负责宏观环境光照演化、天光色温迁移与多光源菲涅尔反射一致性。`,
  },
  {
    id: "physics-tuning",
    title: "物理规则与潜空间微调 (Physics & Latent Tuning)",
    badge: "动力学配置",
    summary: "如何根据具体仿真需求调整重力常数、空气阻尼系数以及体素破坏冲击波参数。",
    contentMarkdown: `### 1. 物理参数矩阵定义

每个沙盒世界维度均包含一套确定性物理配置：

\`\`\`typescript
interface PhysicsProfile {
  gravity: number;   // 重力加速度 (如地球常数 9.8，微重力 2.1，反重力 -1.5)
  drag: number;      // 空气阻尼系数 (0.05 ~ 0.65)
  bounce: number;    // 弹性碰撞系数 (0.02 ~ 0.8)
  entropy: number;   // 场景熵增扰动率 (控制光影随机探索度)
}
\`\`\`

### 2. 体素破拆扰动波算法

当用户触发 \`E\` 键时，系统通过 GLSL 片元着色器实时计算局部潜空间形变波：
$$\\Delta uv = \\frac{uv - c}{\\|uv - c\\|} \\cdot \\sin(35 \\cdot d - 12 \\cdot t) \\cdot e^{-4d}$$
该扰动波引导扩散降噪器重构破损边界，实现无需 3D 网格的物理破坏自愈效果。`,
  },
  {
    id: "enterprise-cluster",
    title: "企业级多卡集群私有部署 (Enterprise Cluster)",
    badge: "工程部署",
    summary: "使用 SGLang 与 Docker 在 8×GPU 集群上实现张量并行推理与高并发动作推流。",
    contentMarkdown: `### 1. 分布式张量并行启动

生产环境推荐使用 8 卡 A100/H100 配置，执行如下命令启动分布式推理引擎：

\`\`\`bash
python3 -m sglang.launch_server \\
  --model-path wangguode/terra-oasis-14b \\
  --port 3200 \\
  --tp 8 \\
  --enable-causal-attention \\
  --mem-fraction-static 0.85
\`\`\`

### 2. Docker 一键容器化部署

\`\`\`bash
docker run --gpus all -d \\
  -p 3200:3200 \\
  --name terra-oasis-engine \\
  ghcr.io/wangguode/terra-oasis:latest
\`\`\`

支持 Kubernetes 弹性扩缩容与动态流媒体转发。`,
  },
];
