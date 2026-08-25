'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useChatStore } from '@/store/useChatStore';
import {
  Eraser,
  Pencil,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Circle,
  Triangle,
  Grid,
  TrendingUp,
  Box,
  Flame,
  Activity,
  Compass,
} from 'lucide-react';

interface ScratchpadProps {
  fullscreen?: boolean;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ fullscreen = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#2563eb'); // Основной синий цвет маркера
  const [lineWidth, setLineWidth] = useState(3);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);

  const { canvasDrawCommand, setCanvasDrawCommand } = useChatStore();

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx && canvas.width > 0 && canvas.height > 0) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = container.clientWidth;
    canvas.height = fullscreen ? Math.max(520, container.clientHeight || 520) : 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (tempCanvas.width > 0 && tempCanvas.height > 0) {
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }
  }, [fullscreen]);

  useEffect(() => {
    resizeCanvas();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  // Рисование мышью
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Сенсорное рисование пальцем / стилусом
  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getTouchPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getTouchPos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // =========================================================================
  // 🎨 ДИНАМИЧЕСКИЕ ЧЕРТЕЖИ (СВЕТЛАЯ ВЫСОКОКОНТРАСТНАЯ ПАЛИТРА)
  // =========================================================================

  const drawKinematics = useCallback((s = '1.2 км (1200 м)', t = '20 мин (1200 с)', v = '? (м/с)') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    const w = canvas.width;
    const h = canvas.height;
    const cy = h / 2 + 10;
    const startX = 60;
    const endX = w - 60;

    ctx.save();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, cy);
    ctx.lineTo(w - 20, cy);
    ctx.stroke();

    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, cy + 18);
    ctx.lineTo(w - 20, cy + 18);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(startX, cy, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Старт (t = 0)', startX - 35, cy + 38);

    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(endX, cy, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`Финиш (t = ${t})`, endX - 75, cy + 38);

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, cy - 35);
    ctx.lineTo(endX, cy - 35);
    ctx.lineTo(endX - 10, cy - 40);
    ctx.moveTo(endX, cy - 35);
    ctx.lineTo(endX - 10, cy - 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(startX, cy - 45); ctx.lineTo(startX, cy - 25);
    ctx.moveTo(endX, cy - 45); ctx.lineTo(endX, cy - 25);
    ctx.stroke();

    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`Расстояние s = ${s}`, (startX + endX) / 2 - 80, cy - 46);

    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.5;
    const vStartX = startX + 40;
    const vEndX = startX + 130;
    ctx.beginPath();
    ctx.moveTo(vStartX, cy - 8);
    ctx.lineTo(vEndX, cy - 8);
    ctx.lineTo(vEndX - 8, cy - 13);
    ctx.moveTo(vEndX, cy - 8);
    ctx.lineTo(vEndX - 8, cy - 3);
    ctx.stroke();

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`v⃗ = ${v}`, vStartX + 15, cy - 16);

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('v = s / t = 1200 м / 1200 с = 1 м/с', (startX + endX) / 2 - 125, h - 20);

    ctx.restore();
    setIsAiMenuOpen(false);
  }, []);

  const drawGasProcess = useCallback((pressure = '10⁵', v1 = 1, v2 = 4) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    const w = canvas.width;
    const h = canvas.height;
    const originX = 75;
    const originY = h - 60;

    ctx.save();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(originX, originY); ctx.lineTo(w - 40, originY);
    ctx.moveTo(originX, originY); ctx.lineTo(originX, 30);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('V (л)', w - 35, originY + 20);
    ctx.fillText('p (Па)', originX - 35, 22);
    ctx.fillText('0', originX - 14, originY + 16);

    const scaleX = (w - originX - 100) / 5;
    const pY = originY - 140;
    const x1 = originX + Number(v1) * scaleX;
    const x2 = originX + Number(v2) * scaleX;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fillRect(x1, pY, x2 - x1, originY - pY);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.strokeRect(x1, pY, x2 - x1, originY - pY);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('A = p · ΔV', (x1 + x2) / 2 - 38, (pY + originY) / 2);

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, pY); ctx.lineTo(x2, pY);
    ctx.stroke();

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(x1, pY, 5, 0, Math.PI * 2);
    ctx.arc(x2, pY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(x1, pY); ctx.lineTo(x1, originY);
    ctx.moveTo(x2, pY); ctx.lineTo(x2, originY);
    ctx.moveTo(x1, pY); ctx.lineTo(originX, pY);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`V₁ = ${v1} л`, x1 - 20, originY + 18);
    ctx.fillText(`V₂ = ${v2} л`, x2 - 20, originY + 18);
    ctx.fillText(`p = ${pressure}`, originX - 65, pY + 4);

    ctx.restore();
    setIsAiMenuOpen(false);
  }, []);

  const drawThermalProcess = useCallback((mass = 2, dt = 50) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2 + 10;

    ctx.save();
    const bw = 120;
    const bh = 130;
    const bx = cx - 50;
    const by = cy - 45;

    ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
    ctx.fillRect(bx - bw / 2 + 3, by - bh / 2 + 35, bw - 6, bh - 38);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx - bw / 2, by - bh / 2, bw, bh);

    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`Вода: m = ${mass} кг`, bx - 45, by + 10);

    const tx = bx + bw / 2 + 45;
    const ty = by - 15;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(tx - 4, ty - 50, 8, 90);

    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(tx, ty + 45, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#be123c';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`Δt = +${dt}°C`, tx + 14, ty - 10);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('Q = c · m · Δt', cx - 55, cy + 95);

    ctx.restore();
    setIsAiMenuOpen(false);
  }, []);

  const drawIsoscelesTriangle = useCallback((vertexAngle: number = 80, baseAngles: number | null = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2 + 45;

    ctx.save();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;

    const B = { x: cx, y: cy - 140 };
    const A = { x: cx - 120, y: cy };
    const C = { x: cx + 120, y: cy };

    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    const midAB = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    ctx.beginPath();
    ctx.moveTo(midAB.x - 8, midAB.y - 4);
    ctx.lineTo(midAB.x + 8, midAB.y + 4);
    ctx.stroke();

    const midBC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
    ctx.beginPath();
    ctx.moveTo(midBC.x - 8, midBC.y + 4);
    ctx.lineTo(midBC.x + 8, midBC.y - 4);
    ctx.stroke();

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(B.x, B.y, 24, Math.PI * 0.28, Math.PI * 0.72);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('B', B.x - 5, B.y - 12);
    ctx.fillText('A', A.x - 18, A.y + 5);
    ctx.fillText('C', C.x + 8, C.y + 5);

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`${vertexAngle}°`, B.x - 10, B.y + 42);

    if (baseAngles !== null) {
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`${baseAngles}°`, A.x + 24, A.y - 6);
      ctx.fillText(`${baseAngles}°`, C.x - 46, C.y - 6);
    } else {
      ctx.fillStyle = '#2563eb';
      ctx.font = '11px monospace';
      ctx.fillText('∠A = ?', A.x - 20, A.y + 22);
      ctx.fillText('∠C = ?', C.x - 15, C.y + 22);
    }

    ctx.restore();
    setIsAiMenuOpen(false);
  }, []);

  const drawInclinedPlane = useCallback((angle = 30) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2 + 50;

    ctx.save();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 140, cy);
    ctx.lineTo(cx + 120, cy);
    ctx.lineTo(cx + 120, cy - 130);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`${angle}°`, cx - 95, cy - 8);

    const bx = cx - 10;
    const by = cy - 65;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-Math.PI * 0.18);
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.fillRect(-22, -15, 44, 30);
    ctx.strokeRect(-22, -15, 44, 30);
    ctx.restore();

    ctx.restore();
    setIsAiMenuOpen(false);
  }, []);

  const drawRightTriangle = useCallback((a = 6, b = 8) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2 + 40;

    ctx.save();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;

    const C = { x: cx - 90, y: cy };
    const A = { x: cx - 90, y: cy - 130 };
    const B = { x: cx + 110, y: cy };

    ctx.beginPath();
    ctx.moveTo(C.x, C.y); ctx.lineTo(A.x, A.y); ctx.lineTo(B.x, B.y);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('A', A.x - 15, A.y - 5);
    ctx.fillText('C', C.x - 15, C.y + 15);
    ctx.fillText('B', B.x + 8, B.y + 5);

    ctx.restore();
    setIsAiMenuOpen(false);
  }, []);

  const drawTrigCircle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.36;

    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(25, cy); ctx.lineTo(w - 25, cy);
    ctx.moveTo(cx, h - 25); ctx.lineTo(cx, 25);
    ctx.stroke();

    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('cos α', w - 50, cy - 8);
    ctx.fillText('sin α', cx + 10, 38);

    ctx.restore();
    setIsAiMenuOpen(false);
  }, []);

  const drawCoordinateAxes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.save();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(25, cy); ctx.lineTo(w - 25, cy);
    ctx.moveTo(cx, h - 25); ctx.lineTo(cx, 25);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '11px monospace';
    ctx.fillText('X', w - 18, cy - 8);
    ctx.fillText('Y', cx + 10, 22);

    ctx.restore();
    setIsAiMenuOpen(false);
  }, []);

  const drawPyramid3D = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2 + 25;

    ctx.save();
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    const S = { x: cx, y: cy - 130 };
    const A = { x: cx - 110, y: cy + 30 };
    const B = { x: cx - 20, y: cy + 60 };
    const C = { x: cx + 110, y: cy + 30 };

    ctx.beginPath();
    ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(S.x, S.y); ctx.lineTo(A.x, A.y);
    ctx.moveTo(S.x, S.y); ctx.lineTo(B.x, B.y);
    ctx.moveTo(S.x, S.y); ctx.lineTo(C.x, C.y);
    ctx.stroke();

    ctx.restore();
    setIsAiMenuOpen(false);
  }, []);

  // ДИСПЕТЧЕР ДИНАМИЧЕСКИХ КОМАНД
  useEffect(() => {
    if (!canvasDrawCommand) return;

    const cmdType = canvasDrawCommand.type;
    const raw = canvasDrawCommand.rawString || '';

    const angleMatch = raw.match(/angle:\s*(\d+)/i);
    const angleVal = angleMatch ? parseInt(angleMatch[1], 10) : 80;

    const baseAngleMatch = raw.match(/base_angles:\s*(\d+)/i);
    const baseAngleVal = baseAngleMatch ? parseInt(baseAngleMatch[1], 10) : null;

    const massMatch = raw.match(/m:\s*(\d+)/i);
    const massVal = massMatch ? parseInt(massMatch[1], 10) : 2;

    const dtMatch = raw.match(/dt:\s*(\d+)/i);
    const dtVal = dtMatch ? parseInt(dtMatch[1], 10) : 50;

    const pMatch = raw.match(/p:\s*([^\s|]+)/i);
    const pVal = pMatch ? pMatch[1] : '10⁵';

    const v1Match = raw.match(/v1:\s*(\d+)/i);
    const v1Val = v1Match ? parseInt(v1Match[1], 10) : 1;

    const v2Match = raw.match(/v2:\s*(\d+)/i);
    const v2Val = v2Match ? parseInt(v2Match[1], 10) : 4;

    const sMatch = raw.match(/s:\s*([^|]+)/i);
    const sVal = sMatch ? sMatch[1].trim() : '1.2 км (1200 м)';

    const tMatch = raw.match(/t:\s*([^|]+)/i);
    const tVal = tMatch ? tMatch[1].trim() : '20 мин (1200 с)';

    const vMatch = raw.match(/v:\s*([^|]+)/i);
    const vVal = vMatch ? vMatch[1].trim() : '? (м/с)';

    if (cmdType === 'kinematics' || cmdType === 'motion') {
      drawKinematics(sVal, tVal, vVal);
    } else if (cmdType === 'gas_process' || cmdType === 'isobar') {
      drawGasProcess(pVal, v1Val, v2Val);
    } else if (cmdType === 'thermal_process') {
      drawThermalProcess(massVal, dtVal);
    } else if (cmdType === 'isosceles_triangle' || cmdType === 'triangle') {
      drawIsoscelesTriangle(angleVal, baseAngleVal);
    } else if (cmdType === 'inclined_plane') {
      drawInclinedPlane(30);
    } else if (cmdType === 'right_triangle') {
      drawRightTriangle(6, 8);
    } else if (cmdType === 'trig_circle') {
      drawTrigCircle();
    } else if (cmdType === 'pyramid_3d') {
      drawPyramid3D();
    } else if (cmdType === 'coordinate_axes') {
      drawCoordinateAxes();
    }

    setCanvasDrawCommand(null);
  }, [
    canvasDrawCommand,
    drawKinematics,
    drawGasProcess,
    drawThermalProcess,
    drawIsoscelesTriangle,
    drawRightTriangle,
    drawTrigCircle,
    drawCoordinateAxes,
    drawInclinedPlane,
    drawPyramid3D,
    setCanvasDrawCommand,
  ]);

  return (
    <div
      className={`flex flex-col bg-white border border-slate-200 rounded-2xl p-4 shadow-sm w-full relative ${
        fullscreen ? 'h-full flex-1' : ''
      }`}
    >
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3 shrink-0">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Pencil size={14} className="text-indigo-600" />
          <span>{fullscreen ? 'Полноэкранный черновик' : 'Интерактивный черновик'}</span>
        </span>

        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setIsAiMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-xl font-bold transition active:scale-95 shadow-xs"
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>Чертежи ИИ</span>
              <ChevronDown size={13} className={`transition-transform ${isAiMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isAiMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-30 space-y-1 animate-in fade-in duration-150">
                <button
                  onClick={() => drawKinematics('1.2 км (1200 м)', '20 мин (1200 с)', '? (м/с)')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 hover:bg-slate-50 rounded-xl transition text-left font-bold"
                >
                  <Compass size={15} className="text-emerald-600" />
                  <span>Физика: Движение (s = 1.2 км)</span>
                </button>
                <button
                  onClick={() => drawGasProcess('10⁵', 1, 4)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-700 hover:bg-slate-50 rounded-xl transition text-left font-bold"
                >
                  <Activity size={15} className="text-blue-600" />
                  <span>Физика: Газы p-V (Работа газа)</span>
                </button>
                <button
                  onClick={() => drawThermalProcess(2, 50)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-700 hover:bg-slate-50 rounded-xl transition text-left"
                >
                  <Flame size={15} className="text-amber-500" />
                  <span>Физика: Нагрев (Q = cmΔt)</span>
                </button>
                <button
                  onClick={() => drawInclinedPlane(30)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition text-left"
                >
                  <TrendingUp size={15} className="text-emerald-600" />
                  <span>Физика: Силы на наклонной</span>
                </button>
                <button
                  onClick={() => drawIsoscelesTriangle(80, 50)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 hover:bg-slate-50 rounded-xl transition text-left font-bold"
                >
                  <Triangle size={15} className="text-emerald-600" />
                  <span>Геометрия: Треугольник (углы 50°)</span>
                </button>
                <button
                  onClick={drawTrigCircle}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition text-left"
                >
                  <Circle size={15} className="text-emerald-600" />
                  <span>Тригонометрический круг</span>
                </button>
                <button
                  onClick={drawPyramid3D}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition text-left"
                >
                  <Box size={15} className="text-indigo-600" />
                  <span>3D Пирамида SABCD</span>
                </button>
                <button
                  onClick={drawCoordinateAxes}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition text-left"
                >
                  <Grid size={15} className="text-slate-500" />
                  <span>Координатные оси (X, Y)</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 gap-1">
            {[
              { c: '#2563eb', label: 'Синий' },
              { c: '#059669', label: 'Зеленый' },
              { c: '#d97706', label: 'Янтарный' },
              { c: '#e11d48', label: 'Красный' },
              { c: '#0f172a', label: 'Графит' },
            ].map(({ c }) => (
              <button
                key={c}
                onClick={() => { setColor(c); setLineWidth(3); }}
                style={{ backgroundColor: c }}
                className={`w-4 h-4 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-indigo-500' : 'opacity-80 hover:opacity-100'}`}
              />
            ))}
          </div>

          <button
            onClick={() => { setColor('#ffffff'); setLineWidth(24); }}
            title="Ластик"
            className={`p-1.5 rounded-xl border text-xs transition ${
              lineWidth === 24
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eraser size={15} />
          </button>

          <button
            onClick={clearCanvas}
            title="Очистить черновик"
            className="p-1.5 bg-slate-50 border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 rounded-xl transition"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`w-full bg-white border border-slate-200 rounded-xl overflow-hidden cursor-crosshair relative shadow-inner touch-none ${
          fullscreen ? 'flex-1 min-h-[500px]' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawingTouch}
          onTouchMove={drawTouch}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
};