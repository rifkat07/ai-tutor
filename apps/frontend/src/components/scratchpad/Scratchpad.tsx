'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Pencil, RotateCcw } from 'lucide-react';

export const Scratchpad: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

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

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-slate-300">Интерактивный черновик</span>
        <div className="flex gap-2">
          <button
            onClick={() => { setColor('#3b82f6'); setLineWidth(3); }}
            className={`p-2 rounded-lg text-slate-300 ${color === '#3b82f6' ? 'bg-blue-600' : 'bg-slate-800'}`}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => { setColor('#0f172a'); setLineWidth(20); }}
            className={`p-2 rounded-lg text-slate-300 ${color === '#0f172a' ? 'bg-blue-600' : 'bg-slate-800'}`}
          >
            <Eraser size={16} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 bg-red-900/50 hover:bg-red-800 text-red-300 rounded-lg transition"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
      <div ref={containerRef} className="w-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};