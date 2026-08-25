'use client';

import React, { useState } from 'react';
import { useChatStore, SUBJECTS } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import { X, ShieldCheck, Award, CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';

interface FipiScoringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Criterion {
  name: string;
  awarded: number;
  max: number;
  comment: string;
}

interface EvaluationResult {
  max_score: number;
  awarded_score: number;
  verdict_summary: string;
  criteria: Criterion[];
  expert_formatting_advice: string;
  ideal_step_hint: string;
}

export const FipiScoringModal: React.FC<FipiScoringModalProps> = ({ isOpen, onClose }) => {
  const { currentTaskContext, activeSubject, examType } = useChatStore();
  const [solutionInput, setSolutionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  if (!isOpen) return null;

  const currentSubj = SUBJECTS[activeSubject] || SUBJECTS.math;

  const handleEvaluate = async () => {
    if (!solutionInput.trim() || loading) return;

    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/competencies/fipi-evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubj.name,
          task_context: currentTaskContext,
          student_solution: solutionInput,
          exam_type: examType,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setResult(json);
      }
    } catch (err) {
      console.error('FIPI evaluation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-3xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden text-slate-900">
        
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl shadow-inner">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Экспертиза Чистовика по Критериям ФИПИ
                </h2>
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
                  Комиссия {examType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Строгая проверка оформления и начисление официальных первичных баллов
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 border border-slate-200 transition">
            <X size={18} />
          </button>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          
          {/* Условие задачи */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs text-slate-800 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Проверяемая задача:</span>
            <KaTeXRenderer content={currentTaskContext} />
          </div>

          {/* Результат проверки эксперта ФИПИ */}
          {result ? (
            <div className="space-y-4">
              
              {/* Баллы и вердикт */}
              <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50/30 border border-indigo-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider">
                    Официальный вердикт эксперта:
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed">{result.verdict_summary}</p>
                </div>
                <div className="bg-white border border-indigo-200 px-4 py-2 rounded-2xl text-center shrink-0 shadow-xs">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Первичный балл:</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {result.awarded_score} <span className="text-xs font-normal text-slate-400">/ {result.max_score}</span>
                  </span>
                </div>
              </div>

              {/* Детализация по критериям */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={15} className="text-indigo-600" /> Разбор критериев оценивания:
                </h3>
                <div className="space-y-2">
                  {result.criteria.map((c, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/90 p-3 rounded-xl space-y-1 text-xs shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          {c.awarded === c.max ? (
                            <CheckCircle2 size={14} className="text-emerald-600" />
                          ) : (
                            <XCircle size={14} className="text-amber-600" />
                          )}
                          {c.name}
                        </span>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                          c.awarded === c.max ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {c.awarded} / {c.max} б.
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] pl-5 leading-relaxed">{c.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Совет по чистовику */}
              <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl space-y-1 text-xs text-amber-950">
                <strong className="text-amber-900 flex items-center gap-1.5 font-bold">
                  <Sparkles size={14} className="text-amber-600" /> Как оформить на 100% максимум баллов:
                </strong>
                <p className="text-amber-900/90 text-[11px] leading-relaxed">{result.expert_formatting_advice}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition"
                >
                  Проверить другое решение
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Вставьте ваше решение для проверки (текст чистовика или ход решения):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Поддерживает формулы и пояснения</span>
                </label>
                <textarea
                  value={solutionInput}
                  onChange={(e) => setSolutionInput(e.target.value)}
                  placeholder="Пример: а) Вынесем sin(x) за скобки: sin(x)(2sin(x) + sqrt(3)) = 0... б) Отбор корней на отрезке [pi, 5pi/2] выполним с помощью числовой окружности..."
                  rows={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition leading-relaxed font-mono"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleEvaluate}
                  disabled={loading || !solutionInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs px-6 py-3 rounded-2xl transition shadow-sm shadow-indigo-600/20 flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  <span>{loading ? 'Эксперт ФИПИ проверяет чистовик...' : 'Запустить экспертизу чистовика'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Подвал */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>Критерии соответствуют демоверсиям ФИПИ</span>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};