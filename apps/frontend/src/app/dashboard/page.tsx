'use client';

import React from 'react';
import Link from 'next/link';
import { Target, Brain, Award, ArrowRight } from 'lucide-react';
import { useChatStore, SUBJECTS } from '@/store/useChatStore';

export default function DashboardPage() {
  const { activeSubject } = useChatStore();
  const currentSubject = SUBJECTS[activeSubject];

  // Динамические темы по предметам для отображения в Кабинете
  const SUBJECT_COMPETENCIES: Record<string, { title: string; fipi: string; status: string }[]> = {
    math: [
      { title: 'Задание №13 (Тригонометрические уравнения)', fipi: '13.1', status: 'Требует повторения' },
      { title: 'Задание №18 (Задачи с параметром)', fipi: '18.2', status: 'В процессе' },
    ],
    physics: [
      { title: 'Задание №21 (Закон сохранения импульса)', fipi: '21.1', status: 'Требует повторения' },
      { title: 'Задание №22 (Термодинамика и газы)', fipi: '22.3', status: 'Освоено' },
    ],
    cs: [
      { title: 'Задание №16 (Рекурсивные алгоритмы)', fipi: '16.1', status: 'Требует повторения' },
    ],
    russian: [
      { title: 'Задание №27 (Сочинение-рассуждение)', fipi: '27.1', status: 'В процессе' },
    ],
  };

  const competencies = SUBJECT_COMPETENCIES[activeSubject] || SUBJECT_COMPETENCIES.math;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold">Личный кабинет ученика</h1>
            {/* Динамический подзаголовок с иконкой и предметом */}
            <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
              <span className="text-base">{currentSubject.icon}</span>
              <span>Подготовка к экзаменам (ЕГЭ / ОГЭ) — <strong className="text-slate-200 font-semibold">{currentSubject.name}</strong></span>
            </p>
          </div>
          <Link
            href="/tutor"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-blue-600/20"
          >
            К занятиям <ArrowRight size={18} />
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Target size={28} /></div>
            <div>
              <p className="text-xs text-slate-400">Прогноз балла (ЕГЭ/ОГЭ)</p>
              <p className="text-2xl font-bold">78 - 84 балла</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Brain size={28} /></div>
            <div>
              <p className="text-xs text-slate-400">Освоено тем Графа</p>
              <p className="text-2xl font-bold">42 / 120 узлов</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><Award size={28} /></div>
            <div>
              <p className="text-xs text-slate-400">Ударный режим (Streak)</p>
              <p className="text-2xl font-bold">12 дней подряд</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>{currentSubject.icon}</span> Карта Компетенций ({currentSubject.name})
            </h2>
            <Link href="/dashboard/graph" className="text-xs text-blue-400 hover:underline">
              Открыть полный граф →
            </Link>
          </div>
          <div className="space-y-4">
            {competencies.map((c, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-slate-400">ФИПИ код: {c.fipi}</p>
                </div>
                <span className="px-3 py-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}