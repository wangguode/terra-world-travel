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
  const [cursorStyle, setCursorStyle] = useState<"default" | "pointer" | "grab" | "grabbing">("grab");

  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mouseDownInfoRef = useRef<{ x: number; y: number; time: number } | null>(null);

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
      paper: WORLD_MODEL_PAPERS_100[0],
    });

    // 2. 6 大领域枢纽节点 (Hub Nodes)
    const hubAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];
    WORLD_MODEL_CATEGORIES.forEach((cat, idx) => {
      const angle = hubAngles[idx];
      const dist = 180;
      const hubId = `hub-${cat.id}`;
      const firstPaperInCat = WORLD_MODEL_PAPERS_100.find((p) => p.category === cat.id) || WORLD_MODEL_PAPERS_100[0];

      nodes.push({
        id: hubId,
        label: cat.name.split(" ")[0],
        labelZh: cat.nameZh.split("与")[0],
        type: "hub",
        category: cat.id,
        color: CATEGORY_COLORS[cat.id] || "#0071e3",
        radius: 18,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        paper: firstPaperInCat,
      });

      links.push({
        source: "root-oasis",
        target: hubId,
        color: "rgba(0, 113, 227, 0.25)",
      });
    });

    // 3. 100 篇前沿论文卫星节点
    WORLD_MODEL_PAPERS_100.forEach((paper, pIdx) => {
      const hubId = `hub-${paper.category}`;
      const color = CATEGORY_COLORS[paper.category] || "#86868b";
      const catIdx = WORLD_MODEL_CATEGORIES.findIndex((c) => c.id === paper.category);
      const baseAngle = catIdx >= 0 ? hubAngles[catIdx] : 0;
      const spread = (Math.PI / 3) * 0.9;
      const angle = baseAngle - spread / 2 + (pIdx % 16) * (spread / 16) + (Math.random() - 0.5) * 0.2;
      const dist = 240 + (pIdx % 6) * 45 + Math.random() * 30;

      const nodeId = `paper-${paper.id}`;
      nodes.push({
        id: nodeId,
        label: paper.title.length > 20 ? paper.title.slice(0, 18) + "…" : paper.title,
        labelZh: paper.titleZh.length > 10 ? paper.titleZh.slice(0, 9) + "…" : paper.titleZh,
        type: "paper",
        category: paper.category,
        color: color,
        radius: pIdx < 12 ? 10 : 7,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        paper: paper,
      });

      links.push({
        source: hubId,
        target: nodeId,
        color: "rgba(210, 210, 215, 0.4)",
      });
    });

    nodesRef.current = nodes;
    linksRef.current = links;
  }, []);

  // 坐标转换辅助函数 (保证与高分辨率 Retina 屏幕 100% 绝对一致)
  const getGraphCoords = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;
      // 中心原点为 rect.width / 2 与 rect.height / 2
      const graphX = (canvasX - rect.width / 2 - panOffset.x) / zoomLevel;
      const graphY = (canvasY - rect.height / 2 - panOffset.y) / zoomLevel;
      return { x: graphX, y: graphY };
    },
    [panOffset, zoomLevel]
  );

  // 动画物理力导向与 Canvas 绘制循环
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

      // 动态适配物理像素与 CSS 逻辑像素
      if (
        canvas.width !== Math.round(displayWidth * dpr) ||
        canvas.height !== Math.round(displayHeight * dpr)
      ) {
        canvas.width = Math.round(displayWidth * dpr);
        canvas.height = Math.round(displayHeight * dpr);
      }

      const nodes = nodesRef.current;
      const links = linksRef.current;

      // 物理排斥力
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          if (distSq < 28000) {
            const force = (n1.radius * n2.radius * 24) / distSq;
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

      // 连线弹簧力
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

      // 向心归位力
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

      // Canvas 绘制
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // 中心位移：严格与 CSS 逻辑宽高一致
      ctx.translate(displayWidth / 2 + panOffset.x, displayHeight / 2 + panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);

      // 绘制背景微弱参考网格
      ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 100;
      const gridExtent = 800;
      for (let x = -gridExtent; x <= gridExtent; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -gridExtent);
        ctx.lineTo(x, gridExtent);
        ctx.stroke();
      }
      for (let y = -gridExtent; y <= gridExtent; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-gridExtent, y);
        ctx.lineTo(gridExtent, y);
        ctx.stroke();
      }

      // 绘制同心轨道环
      [180, 300, 420].forEach((r) => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 113, 227, 0.05)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 绘制拓扑连线
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
        ctx.strokeStyle = isMatch ? link.color : "rgba(210, 210, 215, 0.1)";
        ctx.lineWidth = s.type === "root" ? 1.5 : 1;
        ctx.stroke();
      });

      // 绘制各节点
      nodes.forEach((node) => {
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = !!selectedPaperId && node.paper?.id === selectedPaperId;
        const isCatMatch = selectedCat === "all" || node.category === selectedCat || node.type === "root";
        const isSearchMatch =
          !searchQuery ||
          node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.labelZh.includes(searchQuery) ||
          node.paper?.org.toLowerCase().includes(searchQuery.toLowerCase());

        const opacity = (isCatMatch && isSearchMatch) || isSelected ? 1 : 0.15;

        ctx.save();
        ctx.globalAlpha = opacity;

        // 选中高亮光环
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 12, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 113, 227, 0.2)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
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
        } else if (isHovered && !isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 113, 227, 0.25)";
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

  // 寻找点击或悬停的节点 (灵敏扩大命中范围)
  const findNodeAtCoords = (x: number, y: number) => {
    return nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      const hitRadius = Math.max(n.radius + 14, 24);
      return Math.sqrt(dx * dx + dy * dy) <= hitRadius;
    });
  };

  // 鼠标交互事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mouseDownInfoRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    const { x, y } = getGraphCoords(e.clientX, e.clientY);
    const clickedNode = findNodeAtCoords(x, y);

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
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

    // 检测悬停
    const hover = findNodeAtCoords(x, y);
    setHoveredNode(hover || null);
    setCursorStyle(hover ? "pointer" : "grab");
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const start = mouseDownInfoRef.current;
    if (start) {
      const dist = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      const elapsed = Date.now() - start.time;
      // 轻点或微小位移判定为点击
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
    mouseDownInfoRef.current = null;
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
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white pointer-events-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setSelectedCat("all")}
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
              onClick={() => setSelectedCat(cat.id)}
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

        {/* 搜索与缩放控制 */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "en" ? "Search..." : "检索文献..."}
            className="rounded-full bg-white px-3.5 py-1 text-[13px] text-[#1d1d1f] placeholder-[#86868b] outline-none w-32 sm:w-40 transition"
          />

          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z * 1.2, 3))}
            className="rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-[#1d1d1f] hover:bg-[#e8e8ed] cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z * 0.8, 0.4))}
            className="rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-[#1d1d1f] hover:bg-[#e8e8ed] cursor-pointer"
            title="Zoom Out"
          >
            −
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#0071e3] hover:bg-[#e8e8ed] cursor-pointer"
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
        style={{ cursor: cursorStyle }}
        className="w-full h-[520px] sm:h-[620px] block"
      />

      {/* 悬停浮动信息卡片 (Apple 极简纯净浮窗) */}
      {hoveredNode && (
        <div
          className="absolute bottom-4 left-4 z-10 max-w-sm rounded-[20px] bg-white p-4 text-[13px] pointer-events-none transition"
          data-ui="true"
        >
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
              <div className="text-[12px] text-[#0071e3] font-medium pt-0.5">
                {lang === "en" ? "Read Publication ↗" : "查看学术文献 ↗"}
              </div>
            </div>
          ) : (
            <div className="text-[#515154]">
              {lang === "en" ? "World Model Backbone Node" : "世界模型核心学术支柱"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
