'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useChatStore, SUBJECTS } from '@/store/useChatStore';
import { DiagnosticTestModal } from '@/components/diagnostic/DiagnosticTestModal';
import {
  Target,
  Brain,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Zap,
  Loader2,
  Network,
} from 'lucide-react';

interface AnalyticsData {
  is_started: boolean;
  projected_score: number;
  target_score: number;
  tasks_solved_total: number;
  accuracy_percent: number;
  streak_days: number;
  avg_time_per_task_min: number;
  total_study_time_hours: number;
  subject_mastery: Record<string, number>;
  activity_heatmap: { date: string; day_name: string; count: number; intensity: number }[];
  weak_competencies: { title: string; subject: string; mastery: number; urgency: string; task_template?: string }[];
  mastered_competencies: { title: string; subject: string; mastery: number }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { activeSubject, selectedGrade, pMastery, examType, setTaskContext } = useChatStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDiagOpen, setIsDiagOpen] = useState(false);

  const currentSubject = SUBJECTS[activeSubject] || SUBJECTS.math;

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(
          `${apiBase}/api/v1/competencies/analytics?subject=${activeSubject}&grade=${selectedGrade}&mastery=${pMastery}`
        );
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeSubject, selectedGrade, pMastery]);

  const handleBoostTopic = (topic: any) => {
    const taskCondition = topic.task_template || `Упражнение по теме: ${topic.title}`;
    
    // Загружаем задачу в рабочее пространство
    setTaskContext(
      taskCondition,
      topic.title,
      (topic.mastery || 20) / 100
    );

    // Переходим в окно AI-Репетитора
    router.push('/tutor');
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <span>Загрузка показателей успеваемости...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Шапка */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Дашборд Прогресса Ученика</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 flex items-center gap-2">
              <span>{currentSubject.icon}</span>
              <span>
                {examType === 'SCHOOL'
                  ? `Школьная программа (${selectedGrade} класс) • ${currentSubject.name}`
                  : `Подготовка к ${examType} • ${currentSubject.name}`}
              </span>
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <Link
              href="/graph"
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-xs"
            >
              <Network size={15} /> Карта Графа Знаний
            </Link>
            <button
              onClick={() => setIsDiagOpen(true)}
              className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-xs"
            >
              <Zap size={14} className="text-amber-600 animate-pulse" /> Пройти тест IRT
            </button>
            <Link
              href="/tutor"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md shadow-indigo-600/20"
            >
              К урокам <ArrowRight size={16} />
            </Link>
          </div>
        </header>

        {/* ПЛАШКА СТАРТА */}
        {!data.is_started && (
          <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50/40 border border-amber-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold uppercase">
                Старт подготовки
              </span>
              <h2 className="text-base font-bold text-slate-900">Пройдите 3-минутную Диагностику IRT</h2>
              <p className="text-xs text-slate-600">
                Ответьте на 5 адаптивных вопросов, чтобы система рассчитала ваш реальный стартовый балл и составила индивидуальный трек!
              </p>
            </div>
            <button
              onClick={() => setIsDiagOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-md shadow-amber-500/20 shrink-0 flex items-center gap-1.5"
            >
              <Zap size={14} /> Начать тест
            </button>
          </div>
        )}

        {/* 4 ГЛАВНЫЕ МЕТРИКИ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Текущий прогноз</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Target size={20} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900">
                {data.is_started ? data.projected_score : '—'} <span className="text-sm font-normal text-slate-400">/ 100</span>
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-200">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${data.projected_score}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Точность решений</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900">{data.accuracy_percent}%</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">Решено задач: {data.tasks_solved_total}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Ударный режим</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Award size={20} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900">{data.streak_days} <span className="text-sm font-normal text-slate-400">дн.</span></p>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">
                {data.streak_days > 0 ? '🔥 Регулярные занятия' : 'Начните стрик сегодня!'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Время на задачу</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Clock size={20} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900">{data.avg_time_per_task_min} <span className="text-sm font-normal text-slate-400">мин</span></p>
              <p className="text-[11px] text-slate-500 mt-1">Всего: {data.total_study_time_hours} ч</p>
            </div>
          </div>
        </div>

        {/* СРЕДНЯЯ СЕКЦИЯ: BKT-предметы и График активности */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Brain size={18} className="text-indigo-600" /> Освоение предметов программы
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">Шкала знаний (BKT)</span>
            </div>

            <div className="space-y-3 pt-2">
              {Object.entries(data.subject_mastery).map(([subjKey, percent]) => {
                const info = SUBJECTS[subjKey as keyof typeof SUBJECTS] || SUBJECTS.math;
                return (
                  <div key={subjKey} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                        <span>{info.icon}</span> {info.name}
                      </span>
                      <span className="font-bold text-indigo-600">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ГРАФИК АКТИВНОСТИ (14 ДНЕЙ) */}
          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-600" /> График активности (14 дней)
                </h2>
                <span className="text-[11px] text-slate-500">Частота занятий</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Регулярные занятия повышают долговременную память на 85%.</p>
            </div>

            <div className="grid grid-cols-7 gap-2 py-4">
              {data.activity_heatmap.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    day.count > 0
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <p className="text-[10px] uppercase font-bold text-slate-500">{day.day_name}</p>
                  <p className="text-xs mt-1 font-mono font-bold text-slate-800">{day.date.split('.')[0]}</p>
                  <p className="text-[9px] mt-0.5 opacity-90">{day.count > 0 ? `${day.count} ур` : '—'}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200 pt-3">
              <span>Меньше</span>
              <div className="flex gap-1 items-center">
                <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
                <div className="w-3 h-3 rounded bg-emerald-200 border border-emerald-400" />
                <div className="w-3 h-3 rounded bg-emerald-500" />
              </div>
              <span>Больше</span>
            </div>
          </div>
        </div>

        {/* НИЖНЯЯ СЕКЦИЯ: Зоны роста */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600" /> Зоны роста (Слабые темы {selectedGrade} класса)
            </h2>
            <div className="space-y-3">
              {data.weak_competencies.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">Слабых зон не обнаружено. Решайте задачи для анализа!</p>
              ) : (
                data.weak_competencies.map((topic, i) => (
                  <div
                    key={i}
                    className="bg-slate-50/80 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between hover:border-amber-400 transition"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                        {topic.subject}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-1">{topic.title}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Освоено: {topic.mastery}%</p>
                    </div>
                    <button
                      onClick={() => handleBoostTopic(topic)}
                      className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold px-3.5 py-2 rounded-xl transition shrink-0 active:scale-95 flex items-center gap-1.5 shadow-xs"
                    >
                      Подтянуть <ArrowRight size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" /> Твердые навыки (Освоенные темы)
            </h2>
            <div className="space-y-3">
              {data.mastered_competencies.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">Освоенные темы появятся по мере решения задач на «ВЕРНО!».</p>
              ) : (
                data.mastered_competencies.map((topic, i) => (
                  <div
                    key={i}
                    className="bg-slate-50/80 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                        {topic.subject}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-1">{topic.title}</h3>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700">{topic.mastery}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      <DiagnosticTestModal isOpen={isDiagOpen} onClose={() => setIsDiagOpen(false)} />
    </div>
  );
}