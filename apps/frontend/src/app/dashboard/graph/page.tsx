'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useChatStore, SUBJECTS, SubjectType } from '@/store/useChatStore';
import { KaTeXRenderer } from '@/components/math/KaTeXRenderer';
import {
  Network,
  GraduationCap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Target,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  Loader2,
  X,
} from 'lucide-react';

interface GraphNode {
  id: string;
  title: string;
  level: number;
  status: 'mastered' | 'in_progress' | 'weak' | 'locked';
  mastery: number;
  x: number;
  y: number;
  task: string;
}

interface GraphEdge {
  from: string;
  to: string;
}

interface GraphData {
  subject: string;
  grade: number;
  total_nodes: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function formatSvgTitle(title: string): string[] {
  if (!title) return [''];
  const words = title.split(' ');
  if (words.length <= 2) {
    return [title];
  }
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(' ');
  const line2 = words.slice(mid).join(' ');

  return [
    line1.length > 20 ? line1.substring(0, 18) + '...' : line1,
    line2.length > 20 ? line2.substring(0, 18) + '...' : line2,
  ];
}

export default function KnowledgeGraphPage() {
  const router = useRouter();
  const {
    activeSubject,
    setSubject,
    selectedGrade,
    setSelectedGrade,
    pMastery,
    setTaskContext,
  } = useChatStore();

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentSubj = SUBJECTS[activeSubject] || SUBJECTS.math;

  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true);
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(
          `${apiBase}/api/v1/competencies/graph?subject=${activeSubject}&grade=${selectedGrade}&mastery=${pMastery}`
        );
        if (res.ok) {
          const json = await res.json();
          setGraphData(json);
          if (json.nodes && json.nodes.length > 0) {
            setSelectedNode(json.nodes[0]);
          }
        }
      } catch (err) {
        console.error('Graph fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [activeSubject, selectedGrade, pMastery]);

  const handleStartPractice = (node: GraphNode) => {
    setTaskContext(node.task, node.title, node.mastery / 100);
    router.push('/tutor');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Светлая высококонтрастная палитра узлов
  const getNodeColor = (status: string) => {
    if (status === 'mastered') return '#059669'; // Emerald-600
    if (status === 'in_progress') return '#d97706'; // Amber-600
    if (status === 'weak') return '#e11d48'; // Rose-600
    return '#94a3b8'; // Slate-400
  };

  const getNodeBg = (status: string) => {
    if (status === 'mastered') return 'rgba(5, 150, 105, 0.12)';
    if (status === 'in_progress') return 'rgba(217, 119, 6, 0.12)';
    if (status === 'weak') return 'rgba(225, 29, 72, 0.14)';
    return 'rgba(241, 245, 249, 0.9)';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Шапка графа */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex flex-wrap justify-between items-center gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl shadow-inner">
            <Network size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900">
                Интерактивный Граф Знаний & Навыков
              </h1>
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
                BKT-Навигатор
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Карта взаимосвязи тем программы • Кликните на тему для тренировки
            </p>
          </div>
        </div>

        {/* Выбор Класса и Предмета */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl gap-1">
            {[5, 6, 7, 8, 9, 10, 11].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  selectedGrade === g
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g} кл
              </button>
            ))}
          </div>

          <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl gap-1">
            {Object.values(SUBJECTS).map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id as SubjectType)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                  activeSubject === s.id
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{s.icon}</span>{' '}
                <span className="hidden md:inline">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ГЛАВНАЯ ОБЛАСТЬ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden relative">
        {/* ЛЕВАЯ ЧАСТЬ: ИНТЕРАКТИВНЫЙ ХОЛСТ СЕТИ (2/3) */}
        <div
          className="lg:col-span-2 relative bg-slate-100/60 overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center border-r border-slate-200"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {loading || !graphData ? (
            <div className="flex flex-col items-center justify-center gap-3 text-slate-500 text-xs">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
              <span>Построение карты связей Графа Знаний...</span>
            </div>
          ) : (
            <>
              <svg
                className="w-full h-full select-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
                viewBox="0 0 1050 520"
              >
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                  </marker>
                </defs>

                {/* 1. ЛИНИИ ПРЕРОКВИЗИТОВ */}
                {graphData.edges.map((edge, idx) => {
                  const fromNode = graphData.nodes.find((n) => n.id === edge.from);
                  const toNode = graphData.nodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  return (
                    <line
                      key={idx}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="#cbd5e1"
                      strokeWidth="2.5"
                      strokeDasharray={toNode.status === 'locked' ? '4 4' : undefined}
                      markerEnd="url(#arrow)"
                    />
                  );
                })}

                {/* 2. УЗЛЫ ТЕМ */}
                {graphData.nodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const nodeColor = getNodeColor(node.status);
                  const nodeBg = getNodeBg(node.status);
                  const titleLines = formatSvgTitle(node.title);

                  return (
                    <g
                      key={node.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node);
                      }}
                      className="cursor-pointer transition-all duration-200 group"
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? 36 : 28}
                        fill={nodeBg}
                        stroke={nodeColor}
                        strokeWidth={isSelected ? 3 : 2}
                        className={
                          node.status === 'weak'
                            ? 'animate-pulse'
                            : undefined
                        }
                      />

                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? 16 : 13}
                        fill={nodeColor}
                      />

                      <text
                        x={node.x}
                        y={node.y + 4}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="900"
                        fontFamily="monospace"
                      >
                        {node.status === 'locked' ? '🔒' : `${node.mastery}%`}
                      </text>

                      {/* ТЕКСТ ТЕМЫ НА СВЕТЛОМ ФОНЕ */}
                      <text
                        x={node.x}
                        y={node.y + 44}
                        textAnchor="middle"
                        fill={isSelected ? '#0f172a' : '#475569'}
                        fontSize="10"
                        fontWeight={isSelected ? '800' : '600'}
                        className="pointer-events-none select-none"
                      >
                        {titleLines.map((line, lIdx) => (
                          <tspan
                            key={lIdx}
                            x={node.x}
                            dy={lIdx === 0 ? 0 : 13}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* ПАНЕЛЬ ЗУМА */}
              <div className="absolute bottom-5 left-5 bg-white/95 border border-slate-200 p-1.5 rounded-2xl flex items-center gap-1 shadow-md z-10">
                <button
                  onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                  title="Приблизить"
                  className="p-2 hover:bg-slate-100 text-slate-700 rounded-xl transition"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                  title="Отдалить"
                  className="p-2 hover:bg-slate-100 text-slate-700 rounded-xl transition"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  title="Сбросить вид"
                  className="p-2 hover:bg-slate-100 text-slate-700 rounded-xl transition"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* ЛЕГЕНДА СТАТУСОВ */}
              <div className="absolute bottom-5 right-5 bg-white/95 border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3.5 text-xs shadow-md z-10">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Освоено (&gt;80%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 font-bold text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> В процессе (40–80%)
                </span>
                <span className="flex items-center gap-1.5 text-rose-700 font-bold text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Пробел (&lt;40%)
                </span>
              </div>
            </>
          )}
        </div>

        {/* ПРАВАЯ ЧАСТЬ: ИНСПЕКТОР ВЫБРАННОЙ ТЕМЫ (1/3) */}
        <div className="bg-white border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto z-10">
          {selectedNode ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Уровень {selectedNode.level} • {selectedGrade} класс
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      selectedNode.status === 'mastered'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : selectedNode.status === 'in_progress'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : selectedNode.status === 'weak'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {selectedNode.status === 'mastered'
                      ? '✓ Освоено'
                      : selectedNode.status === 'in_progress'
                      ? '🟡 В процессе'
                      : selectedNode.status === 'weak'
                      ? '⚠️ Пробел'
                      : '🔒 Закрыто'}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {selectedNode.title}
                </h2>
              </div>

              {/* Шкала мастерства BKT */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Уровень владения (BKT):</span>
                  <strong className="text-slate-900 text-sm font-mono font-bold">
                    {selectedNode.mastery}%
                  </strong>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300/60">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedNode.mastery}%`,
                      backgroundColor: getNodeColor(selectedNode.status),
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-600 pt-0.5">
                  {selectedNode.mastery >= 80
                    ? 'Тема усвоена прочно. Рекомендуется периодическое повторение.'
                    : selectedNode.mastery >= 40
                    ? 'Базовые навыки есть, но при решении требуются подсказки.'
                    : 'Критический пробел. Решение задач этой темы блокирует последующие разделы!'}
                </p>
              </div>

              {/* ПРИМЕР ЗАДАНИЯ С ПОЛНОЦЕННЫМ KaTeXRenderer */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                  Пример ключевого задания:
                </span>
                <div className="text-xs text-slate-900 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 font-sans shadow-2xs">
                  <KaTeXRenderer content={selectedNode.task} />
                </div>
              </div>

              {/* КНОПКА ЗАПУСКА ТРЕНИРОВКИ */}
              <div className="pt-2">
                <button
                  onClick={() => handleStartPractice(selectedNode)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Target size={16} />
                  <span>Тренировать тему с AI-Репетитором</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              Выберите тему на карте слева
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs">
            <Link
              href="/dashboard"
              className="text-slate-500 hover:text-slate-900 transition flex items-center gap-1 font-medium"
            >
              ← Вернуться в Кабинет
            </Link>
            <Link
              href="/tutor"
              className="text-indigo-600 hover:text-indigo-500 font-bold transition flex items-center gap-1"
            >
              К урокам →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}