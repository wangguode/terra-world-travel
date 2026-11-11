"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import {
  WORLD_MODEL_PAPERS_100,
  WORLD_MODEL_CATEGORIES,
  WorldModelPaper,
} from "@/lib/world-model-papers-100";

interface GraphNode {
  id: string;
  label: string;
  labelZh: string;
  type: "root" | "hub" | "paper";
  category: string;
  color: string;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  paper?: WorldModelPaper;
}

interface GraphLink {
  source: string;
  target: string;
}

interface KnowledgeGraphProps {
  onSelectPaper: (paper: WorldModelPaper) => void;
  selectedPaperId?: string;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "interactive-engines": "#0071e3",
  "embodied-robotics": "#34c759",
  "autonomous-driving": "#ff9500",
  "causal-diffusion": "#5856d6",
  "3d-4d-gaussian": "#af52de",
  "planning-rl": "#ff2d55",
};

export function WorldModelKnowledgeGraph({
  onSelectPaper,
  selectedPaperId,
  className = "",
}: KnowledgeGraphProps) {
  const { lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorStyle, setCursorStyle] = useState<"grab" | "grabbing" | "pointer">("grab");

  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mouseDownRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const alphaRef = useRef<number>(1.0); // 物理衰减系数，达到平衡后自动休眠省电

  // 1. 初始化图谱拓扑网络 (仅在挂载时运行一次)
  useEffect(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // 中心核心世界模型节点
    nodes.push({
      id: "root-oasis",
      label: "TERRA-OASIS 14B",
      labelZh: "TERRA-OASIS",
      type: "root",
      category: "root",
      color: "#0071e3",
      radius: 26,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      paper: WORLD_MODEL_PAPERS_100[0],
    });

    // 6 大枢纽领域节点
    const hubAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];
    WORLD_MODEL_CATEGORIES.forEach((cat, idx) => {
      const angle = hubAngles[idx];
      const dist = 170;
      const hubId = `hub-${cat.id}`;
      const firstPaper = WORLD_MODEL_PAPERS_100.find((p) => p.category === cat.id) || WORLD_MODEL_PAPERS_100[0];

      nodes.push({
        id: hubId,
        label: cat.name.split(" ")[0],
        labelZh: cat.nameZh.split("与")[0],
        type: "hub",
        category: cat.id,
        color: CATEGORY_COLORS[cat.id] || "#0071e3",
        radius: 16,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        paper: firstPaper,
      });

      links.push({ source: "root-oasis", target: hubId });
    });

    // 100 篇前沿文献节点
    WORLD_MODEL_PAPERS_100.forEach((paper, pIdx) => {
      const hubId = `hub-${paper.category}`;
      const color = CATEGORY_COLORS[paper.category] || "#86868b";
      const catIdx = WORLD_MODEL_CATEGORIES.findIndex((c) => c.id === paper.category);
      const baseAngle = catIdx >= 0 ? hubAngles[catIdx] : 0;
      const spread = (Math.PI / 3) * 0.9;
      const angle = baseAngle - spread / 2 + (pIdx % 16) * (spread / 16) + (Math.random() - 0.5) * 0.15;
      const dist = 240 + (pIdx % 6) * 42 + Math.random() * 25;

      const nodeId = `paper-${paper.id}`;
      nodes.push({
        id: nodeId,
        label: paper.title.length > 20 ? paper.title.slice(0, 18) + "…" : paper.title,
        labelZh: paper.titleZh.length > 10 ? paper.titleZh.slice(0, 9) + "…" : paper.titleZh,
        type: "paper",
        category: paper.category,
        color: color,
        radius: pIdx < 12 ? 9 : 6.5,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        paper: paper,
      });

      links.push({ source: hubId, target: nodeId });
    });

    nodesRef.current = nodes;
    linksRef.current = links;
    alphaRef.current = 1.0;
  }, []);

  // 坐标换算函数 (支持高分辨率 Retina 屏幕精准映射)
  const getGraphCoords = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;
      const graphX = (canvasX - rect.width / 2 - panOffset.x) / zoomLevel;
      const graphY = (canvasY - rect.height / 2 - panOffset.y) / zoomLevel;
      return { x: graphX, y: graphY };
    },
    [panOffset, zoomLevel]
  );

  // 2. 动画渲染与渐进冷却物理模拟 (Alpha Cooling Simulation)
  useEffect(() => {
    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = rect.width;
      const displayHeight = rect.height;

      if (
        canvas.width !== Math.round(displayWidth * dpr) ||
        canvas.height !== Math.round(displayHeight * dpr)
      ) {
        canvas.width = Math.round(displayWidth * dpr);
        canvas.height = Math.round(displayHeight * dpr);
      }

      const nodes = nodesRef.current;
      const links = linksRef.current;
      const alpha = alphaRef.current;

      // 物理迭代计算：仅在 alpha > 0.005 或拖拽时计算，平衡后自动休眠节省性能
      if (alpha > 0.005 || draggedNodeRef.current) {
        // 排斥力
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = dx * dx + dy * dy || 1;
            if (distSq < 26000) {
              const force = ((n1.radius * n2.radius * 20) / distSq) * alpha;
              const dist = Math.sqrt(distSq);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              if (n1.type !== "root" && n1 !== draggedNodeRef.current) {
                n1.vx -= fx;
                n1.vy -= fy;
              }
              if (n2.type !== "root" && n2 !== draggedNodeRef.current) {
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }

        // 弹簧引力
        const nodeMap = new Map<string, GraphNode>();
        nodes.forEach((n) => nodeMap.set(n.id, n));

        links.forEach((link) => {
          const s = nodeMap.get(link.source);
          const t = nodeMap.get(link.target);
          if (!s || !t) return;
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = s.type === "root" ? 170 : 85;
          const force = (dist - targetDist) * 0.003 * alpha;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (s.type !== "root" && s !== draggedNodeRef.current) {
            s.vx += fx;
            s.vy += fy;
          }
          if (t.type !== "root" && t !== draggedNodeRef.current) {
            t.vx -= fx;
            t.vy -= fy;
          }
        });

        // 位置阻尼更新
        nodes.forEach((n) => {
          if (n.type === "root" || n === draggedNodeRef.current) {
            if (n.type === "root") {
              n.x = 0;
              n.y = 0;
            }
            return;
          }
          n.vx -= n.x * 0.0005 * alpha;
          n.vy -= n.y * 0.0005 * alpha;
          n.vx *= 0.85;
          n.vy *= 0.85;
          n.x += n.vx;
          n.y += n.vy;
        });

        // 物理能量自然衰减
        if (!draggedNodeRef.current) {
          alphaRef.current *= 0.985;
        }
      }

      // Canvas 绘制 (纯正 Apple 白昼通透画风)
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // 中心位移
      ctx.translate(displayWidth / 2 + panOffset.x, displayHeight / 2 + panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);

      // 绘制极简轨道环
      [170, 290, 410].forEach((r) => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.035)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 绘制拓扑连线
      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach((n) => nodeMap.set(n.id, n));

      links.forEach((link) => {
        const s = nodeMap.get(link.source);
        const t = nodeMap.get(link.target);
        if (!s || !t) return;

        const isMatch =
          selectedCat === "all" ||
          s.category === selectedCat ||
          t.category === selectedCat ||
          s.type === "root";

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = isMatch ? "rgba(0, 113, 227, 0.15)" : "rgba(0, 0, 0, 0.04)";
        ctx.lineWidth = s.type === "root" ? 1.5 : 1;
        ctx.stroke();
      });

      // 绘制节点
      nodes.forEach((node) => {
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = !!selectedPaperId && node.paper?.id === selectedPaperId;
        const isCatMatch = selectedCat === "all" || node.category === selectedCat || node.type === "root";

        const opacity = isCatMatch || isSelected ? 1 : 0.15;

        ctx.save();
        ctx.globalAlpha = opacity;

        // 选中外环
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 113, 227, 0.15)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "#0071e3";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // 节点发光
        if (node.type === "root") {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 113, 227, 0.1)";
          ctx.fill();
        } else if (isHovered && !isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 113, 227, 0.2)";
          ctx.fill();
        }

        // 节点圆心
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // 中心白圈
        if (node.type === "root" || node.type === "hub") {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        }

        // 标签文字
        if (node.type === "root" || node.type === "hub" || isHovered || isSelected || zoomLevel > 1.25) {
          ctx.font = isSelected || node.type === "root"
            ? "600 12px -apple-system, sans-serif"
            : node.type === "hub"
            ? "500 11px -apple-system, sans-serif"
            : "400 11px -apple-system, sans-serif";
          ctx.fillStyle = isSelected ? "#0071e3" : isHovered ? "#0071e3" : "#1d1d1f";
          ctx.textAlign = "center";
          const label = lang === "en" ? node.label : node.labelZh;
          ctx.fillText(label, node.x, node.y + node.radius + 13);
        }

        ctx.restore();
      });

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [panOffset, zoomLevel, selectedCat, hoveredNode, selectedPaperId, lang]);

  // 精准且灵敏的命中检测
  const findNodeAtCoords = (x: number, y: number) => {
    return nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      const hitRadius = Math.max(n.radius + 14, 24);
      return Math.sqrt(dx * dx + dy * dy) <= hitRadius;
    });
  };

  // 鼠标交互事件
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mouseDownRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    const { x, y } = getGraphCoords(e.clientX, e.clientY);
    const clickedNode = findNodeAtCoords(x, y);

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
      alphaRef.current = 0.5; // 唤醒物理微调
      setCursorStyle("grabbing");
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      setCursorStyle("grabbing");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getGraphCoords(e.clientX, e.clientY);

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = x;
      draggedNodeRef.current.y = y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
      return;
    }

    if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    const hover = findNodeAtCoords(x, y);
    setHoveredNode(hover || null);
    setCursorStyle(hover ? "pointer" : "grab");
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const start = mouseDownRef.current;
    if (start) {
      const dist = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      const elapsed = Date.now() - start.time;
      if (dist < 6 && elapsed < 400) {
        const { x, y } = getGraphCoords(e.clientX, e.clientY);
        const node = findNodeAtCoords(x, y);
        if (node?.paper) {
          onSelectPaper(node.paper);
        } else if (node?.type === "root") {
          onSelectPaper(WORLD_MODEL_PAPERS_100[0]);
        } else if (node?.type === "hub") {
          const firstInCat = WORLD_MODEL_PAPERS_100.find((p) => p.category === node.category);
          if (firstInCat) onSelectPaper(firstInCat);
        }
      }
    }

    draggedNodeRef.current = null;
    setIsDraggingCanvas(false);
    mouseDownRef.current = null;
    setCursorStyle(hoveredNode ? "pointer" : "grab");
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getGraphCoords(e.clientX, e.clientY);
    const node = findNodeAtCoords(x, y);
    if (node?.paper) {
      onSelectPaper(node.paper);
    } else if (node?.type === "root") {
      onSelectPaper(WORLD_MODEL_PAPERS_100[0]);
    } else if (node?.type === "hub") {
      const firstInCat = WORLD_MODEL_PAPERS_100.find((p) => p.category === node.category);
      if (firstInCat) onSelectPaper(firstInCat);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoomLevel((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 3.0));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedCat("all");
    alphaRef.current = 0.5;
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-[28px] bg-[#fbfbfd] select-none ${className}`}>
      {/* 顶部极简领域分类药丸 (Apple 官方极简，无复杂工具箱) */}
      <div className="absolute top-4 inset-x-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none" data-ui="true">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white pointer-events-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => {
              setSelectedCat("all");
              alphaRef.current = 0.4;
            }}
            className={`rounded-full px-3.5 py-1 text-[12px] font-medium transition cursor-pointer shrink-0 ${
              selectedCat === "all"
                ? "bg-[#0071e3] text-white"
                : "text-[#515154] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
            }`}
          >
            {lang === "en" ? "All" : "全部"} (100)
          </button>
          {WORLD_MODEL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCat(cat.id);
                alphaRef.current = 0.4;
              }}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                selectedCat === cat.id
                  ? "bg-[#0071e3] text-white"
                  : "text-[#515154] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat.id] }}
              />
              <span>{lang === "en" ? cat.name : cat.nameZh}</span>
            </button>
          ))}
        </div>

        {/* 右上角极简重置视角 */}
        <button
          type="button"
          onClick={handleReset}
          className="pointer-events-auto rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#515154] hover:text-[#0071e3] transition cursor-pointer"
        >
          {lang === "en" ? "Reset View" : "重置视角"}
        </button>
      </div>

      {/* Canvas 画布 */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        style={{ cursor: cursorStyle }}
        className="w-full h-[500px] sm:h-[580px] block"
      />

      {/* 悬停浮动微卡片 */}
      {hoveredNode && hoveredNode.paper && (
        <div
          className="absolute bottom-4 left-4 z-10 max-w-sm rounded-[18px] bg-white p-3.5 text-[13px] pointer-events-none transition"
          data-ui="true"
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: hoveredNode.color }}
            />
            <span className="font-semibold text-[#1d1d1f] line-clamp-1">
              {lang === "en" ? hoveredNode.paper.title : hoveredNode.paper.titleZh}
            </span>
          </div>
          <div className="text-[12px] text-[#86868b]">
            {hoveredNode.paper.org} · {hoveredNode.paper.venue}
          </div>
        </div>
      )}
    </div>
  );
}
