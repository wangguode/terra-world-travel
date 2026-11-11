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
  color: string;
}

interface KnowledgeGraphProps {
  onSelectPaper: (paper: WorldModelPaper) => void;
  selectedPaperId?: string;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "interactive-engines": "#0071e3", // Apple Blue
  "embodied-robotics": "#34c759",   // Apple Green
  "autonomous-driving": "#ff9500",  // Apple Amber
  "causal-diffusion": "#5856d6",   // Apple Indigo
  "3d-4d-gaussian": "#af52de",     // Apple Purple
  "planning-rl": "#ff2d55",        // Apple Rose
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
  const [searchQuery, setSearchQuery] = useState("");

  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 初始化图谱节点与连线
  useEffect(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // 1. 中心超级节点 (TERRA-OASIS 核心因果世界模型)
    nodes.push({
      id: "root-oasis",
      label: "TERRA-OASIS 14B",
      labelZh: "TERRA-OASIS 世界模型",
      type: "root",
      category: "root",
      color: "#0071e3",
      radius: 28,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    });

    // 2. 6 大领域枢纽节点 (Hub Nodes)
    const hubAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];
    WORLD_MODEL_CATEGORIES.forEach((cat, idx) => {
      const angle = hubAngles[idx];
      const dist = 180;
      const hubNode: GraphNode = {
        id: `hub-${cat.id}`,
        label: cat.name,
        labelZh: cat.nameZh,
        type: "hub",
        category: cat.id,
        color: CATEGORY_COLORS[cat.id] || "#0071e3",
        radius: 18,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
      };
      nodes.push(hubNode);

      // 连向中心节点
      links.push({
        source: "root-oasis",
        target: hubNode.id,
        color: "#d2d2d7",
      });
    });

    // 3. 100 篇前沿论文节点
    WORLD_MODEL_PAPERS_100.forEach((paper, index) => {
      const hubIndex = WORLD_MODEL_CATEGORIES.findIndex((c) => c.id === paper.category);
      const baseAngle = hubIndex >= 0 ? hubAngles[hubIndex] : 0;
      const spread = (Math.PI / 3) * ((index % 16) / 16 - 0.5) * 1.5;
      const angle = baseAngle + spread;
      const dist = 280 + (index % 5) * 55;

      const paperNode: GraphNode = {
        id: paper.id,
        label: paper.title.length > 24 ? paper.title.slice(0, 22) + "..." : paper.title,
        labelZh: paper.titleZh.length > 14 ? paper.titleZh.slice(0, 12) + "..." : paper.titleZh,
        type: "paper",
        category: paper.category,
        color: CATEGORY_COLORS[paper.category] || "#515154",
        radius: 8 + (index < 10 ? 4 : 0),
        x: Math.cos(angle) * dist + (Math.random() - 0.5) * 40,
        y: Math.sin(angle) * dist + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        paper: paper,
      };
      nodes.push(paperNode);

      // 连接到对应的领域 Hub
      links.push({
        source: `hub-${paper.category}`,
        target: paperNode.id,
        color: "#e5e5ea",
      });

      // 代表作之间的交叉连接边
      if (index > 0 && index % 7 === 0) {
        links.push({
          source: WORLD_MODEL_PAPERS_100[index - 1].id,
          target: paperNode.id,
          color: "#e8e8ed",
        });
      }
    });

    nodesRef.current = nodes;
    linksRef.current = links;
  }, []);

  // 物理力导向模拟循环 (Force Simulation Loop)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;
      const nodes = nodesRef.current;
      const links = linksRef.current;

      // 1. 节点间斥力 (Repulsion)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          if (dist < 400) {
            const force = (320 / distSq) * 0.4;
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

      // 2. 连线弹簧力 (Spring Attraction)
      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach((n) => nodeMap.set(n.id, n));

      links.forEach((link) => {
        const s = nodeMap.get(link.source);
        const t = nodeMap.get(link.target);
        if (!s || !t) return;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = s.type === "root" ? 170 : 90;
        const force = (dist - targetDist) * 0.003;
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

      // 3. 向心归位力与阻尼减速
      nodes.forEach((n) => {
        if (n.type === "root" || n === draggedNodeRef.current) {
          if (n.type === "root") {
            n.x = 0;
            n.y = 0;
          }
          return;
        }
        n.vx -= n.x * 0.0006;
        n.vy -= n.y * 0.0006;
        n.vx *= 0.88;
        n.vy *= 0.88;
        n.x += n.vx;
        n.y += n.vy;
      });

      // 4. Canvas 绘制 (Apple 纯白/高光极简风)
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2 + panOffset.x, height / 2 + panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);

      // 绘制背景网格微点 (Apple 极简风格)
      ctx.fillStyle = "#f0f0f2";
      const gridSize = 40;
      const startX = Math.floor((-width / zoomLevel - panOffset.x) / gridSize) * gridSize;
      const endX = Math.ceil((width / zoomLevel - panOffset.x) / gridSize) * gridSize;
      const startY = Math.floor((-height / zoomLevel - panOffset.y) / gridSize) * gridSize;
      const endY = Math.ceil((height / zoomLevel - panOffset.y) / gridSize) * gridSize;
      for (let x = startX; x <= endX; x += gridSize) {
        for (let y = startY; y <= endY; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 绘制连线 (Edges)
      links.forEach((link) => {
        const s = nodeMap.get(link.source);
        const t = nodeMap.get(link.target);
        if (!s || !t) return;

        const isHighlighted =
          hoveredNode &&
          (hoveredNode.id === s.id || hoveredNode.id === t.id);

        const isCatMatch =
          selectedCat === "all" ||
          s.category === selectedCat ||
          t.category === selectedCat ||
          s.type === "root";

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);

        if (isHighlighted) {
          ctx.strokeStyle = "#0071e3";
          ctx.lineWidth = 2.2;
        } else if (isCatMatch) {
          ctx.strokeStyle = "#e5e5ea";
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = "#f5f5f7";
          ctx.lineWidth = 0.5;
        }
        ctx.stroke();
      });

      // 绘制节点 (Nodes)
      nodes.forEach((node) => {
        const isHovered = hoveredNode?.id === node.id;
        const isCatMatch = selectedCat === "all" || node.category === selectedCat || node.type === "root";
        const isSearchMatch =
          !searchQuery ||
          node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.labelZh.includes(searchQuery) ||
          node.paper?.org.toLowerCase().includes(searchQuery.toLowerCase());

        const isSelected = !!selectedPaperId && node.paper?.id === selectedPaperId;
        const opacity = (isCatMatch && isSearchMatch) || isSelected ? 1 : 0.15;

        ctx.save();
        ctx.globalAlpha = opacity;

        // 选中高亮光晕 (Selected Glow Ring)
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 12, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 113, 227, 0.2)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = "#0071e3";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // 节点外环发光
        if (node.type === "root") {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 113, 227, 0.12)";
          ctx.fill();
        } else if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 113, 227, 0.2)";
          ctx.fill();
        }

        // 节点实体圆
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // 节点内白圈 (Apple 风格同心圆)
        if (node.type === "root" || node.type === "hub") {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        }

        // 节点文字 Label
        if (node.type === "root" || node.type === "hub" || isHovered || isSelected || zoomLevel > 1.2) {
          ctx.font = isSelected
            ? "600 13px -apple-system, sans-serif"
            : node.type === "root"
            ? "600 13px -apple-system, sans-serif"
            : node.type === "hub"
            ? "500 12px -apple-system, sans-serif"
            : "400 11px -apple-system, sans-serif";
          ctx.fillStyle = isSelected ? "#0071e3" : isHovered ? "#0071e3" : "#1d1d1f";
          ctx.textAlign = "center";
          const displayLabel = lang === "en" ? node.label : node.labelZh;
          ctx.fillText(displayLabel, node.x, node.y + node.radius + 14);

          if (isSelected) {
            ctx.font = "600 10px -apple-system, sans-serif";
            ctx.fillStyle = "#0071e3";
            ctx.fillText(lang === "en" ? "[Reading Below]" : "[正在下方阅读]", node.x, node.y + node.radius + 28);
          }
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
  }, [panOffset, zoomLevel, selectedCat, hoveredNode, searchQuery, selectedPaperId, lang]);

  // 画布重设与响应式缩放
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 坐标转换辅助函数
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

  // 鼠标交互事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getGraphCoords(e.clientX, e.clientY);
    const clickedNode = nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    });

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
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

    // 寻找悬停节点
    const hover = nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });
    setHoveredNode(hover || null);
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    setIsDraggingCanvas(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getGraphCoords(e.clientX, e.clientY);
    const clickedNode = nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clickedNode?.paper) {
      onSelectPaper(clickedNode.paper);
    } else if (clickedNode?.type === "root") {
      onSelectPaper(WORLD_MODEL_PAPERS_100[0]);
    } else if (clickedNode?.type === "hub") {
      const firstInCat = WORLD_MODEL_PAPERS_100.find((p) => p.category === clickedNode.category);
      if (firstInCat) onSelectPaper(firstInCat);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoomLevel((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 3.0));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedCat("all");
    setSearchQuery("");
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-[32px] bg-[#fbfbfd] select-none ${className}`}>
      {/* 顶部工具栏：分类高亮药丸 + 实时检索 + 视角控制 */}
      <div className="absolute top-4 inset-x-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none" data-ui="true">
        {/* 分类过滤 Pills */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white border border-[#d2d2d7]/60 pointer-events-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setSelectedCat("all")}
            className={`rounded-full px-3.5 py-1 text-[12px] font-medium transition cursor-pointer shrink-0 ${
              selectedCat === "all"
                ? "bg-[#0071e3] text-white"
                : "text-[#515154] hover:text-[#1d1d1f]"
            }`}
          >
            {lang === "en" ? "All Universe (100+)" : "全景星空 (100+)"}
          </button>
          {WORLD_MODEL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                selectedCat === cat.id
                  ? "bg-[#0071e3] text-white"
                  : "text-[#515154] hover:text-[#1d1d1f]"
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

        {/* 搜索与缩放控制 */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "en" ? "Search in graph..." : "在图谱中搜索..."}
            className="rounded-full bg-white border border-[#d2d2d7]/60 px-3.5 py-1 text-[13px] text-[#1d1d1f] placeholder-[#86868b] outline-none w-36 sm:w-44 transition"
          />

          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z * 1.2, 3))}
            className="rounded-full bg-white border border-[#d2d2d7]/60 px-3 py-1 text-[13px] font-semibold text-[#1d1d1f] hover:bg-[#e8e8ed] cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z * 0.8, 0.4))}
            className="rounded-full bg-white border border-[#d2d2d7]/60 px-3 py-1 text-[13px] font-semibold text-[#1d1d1f] hover:bg-[#e8e8ed] cursor-pointer"
            title="Zoom Out"
          >
            −
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="rounded-full bg-white border border-[#d2d2d7]/60 px-3 py-1 text-[12px] font-medium text-[#0071e3] hover:bg-[#e8e8ed] cursor-pointer"
          >
            {lang === "en" ? "Reset" : "重置"}
          </button>
        </div>
      </div>

      {/* Canvas 主物理力导向图谱 */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-[520px] sm:h-[620px] cursor-grab active:cursor-grabbing block"
      />

      {/* 悬停浮动信息卡片 (Apple 极简浮窗) */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 z-10 max-w-sm rounded-[20px] bg-white p-4 border border-[#d2d2d7]/60 text-[13px] pointer-events-none transition" data-ui="true">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: hoveredNode.color }}
            />
            <span className="font-semibold text-[#1d1d1f]">
              {lang === "en" ? hoveredNode.label : hoveredNode.labelZh}
            </span>
          </div>

          {hoveredNode.paper ? (
            <div className="space-y-1 text-[#515154]">
              <div>{hoveredNode.paper.org} · {hoveredNode.paper.venue}</div>
              <div className="text-[12px] text-[#86868b]">{hoveredNode.paper.arxiv}</div>
              <div className="text-[12px] text-[#0071e3] font-medium pt-1">
                {lang === "en" ? "Click to read full Markdown below ↓" : "点击直接在下方以 Markdown 风格阅读 ↓"}
              </div>
            </div>
          ) : (
            <div className="text-[#515154]">
              {lang === "en" ? "World Model Core Pillar. Click to inspect papers." : "世界模型核心学术支柱。包含多篇关联前沿文献。"}
            </div>
          )}
        </div>
      )}

      {/* 底部交互指引小注脚 */}
      <div className="absolute bottom-4 right-4 z-10 text-[12px] text-[#86868b] bg-[#f5f5f7] px-3.5 py-1 rounded-full pointer-events-none">
        {lang === "en"
          ? "Drag nodes · Scroll to zoom · Click node to read Markdown below"
          : "可自由拖拽节点 · 滚轮缩放 · 点击任意节点直接在下方以 Markdown 风格阅读"}
      </div>
    </div>
  );
}
