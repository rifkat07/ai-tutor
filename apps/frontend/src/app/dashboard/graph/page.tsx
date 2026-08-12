'use client';

import React, { useEffect, useRef } from 'react';

export default function GraphViewPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes = [
      { id: 1, x: 200, y: 300, label: 'Алгебра базовые', color: '#10b981' },
      { id: 2, x: 400, y: 200, label: 'Тригонометрия', color: '#f59e0b' },
      { id: 3, x: 400, y: 400, label: 'Логарифмы', color: '#10b981' },
      { id: 4, x: 600, y: 300, label: 'Параметры (№18)', color: '#ef4444' },
    ];

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;

    [[0,1], [0,2], [1,3], [2,3]].forEach(([s, e]) => {
      ctx.beginPath();
      ctx.moveTo(nodes[s].x, nodes[s].y);
      ctx.lineTo(nodes[e].x, nodes[e].y);
      ctx.stroke();
    });

    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 24, 0, 2 * Math.PI);
      ctx.fillStyle = n.color;
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText(n.label, n.x - 30, n.y + 40);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-xl font-bold mb-4">Интерактивный Граф Знаний (Профильная Математика)</h1>
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}