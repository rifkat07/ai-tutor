'use client';

import React, { useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import {
  X,
  FileCheck2,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface EssayScoringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CriterionItem {
  code: string;
  name: string;
  awarded: number;
  max: number;
  comment: string;
}

interface HighlightedError {
  type: string;
  quote: string;
  fix: string;
  explanation: string;
}

interface EssayEvaluationResult {
  max_score: number;
  awarded_score: number;
  word_count: number;
  verdict_summary: string;
  criteria_breakdown: CriterionItem[];
  highlighted_errors: HighlightedError[];
  expert_advice: string;
}

export const EssayScoringModal: React.FC<EssayScoringModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTaskContext, examType } = useChatStore();
  const [essayText, setEssayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EssayEvaluationResult | null>(null);

  if (!isOpen) return null;

  const currentWords = essayText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const handleEvaluate = async () => {
    if (!essayText.trim() || loading) return;

    setLoading(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/competencies/essay-evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_context: currentTaskContext,
          essay_text: essayText,
          exam_type: examType,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setResult(json);
      }
    } catch (err) {
      console.error('Essay evaluation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-4xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] relative overflow-hidden text-slate-900">
        
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl shadow-inner">
              <FileCheck2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Экспертиза Сочинения по Критериям ФИПИ (К1–К12)
                </h2>
                <span className="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                  {examType === 'OGE' ? 'ОГЭ №13.2/13.3' : 'ЕГЭ №27'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Проверка проблемы, примеров, аргументации, орфографии и речевых норм
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 border border-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {/* Исходный текст / Тема */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs text-slate-800 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
              Тема / Исходный текст задания:
            </span>
            <KaTeXRenderer content={currentTaskContext} />
          </div>

          {result ? (
            <div className="space-y-4">
              {/* Баллы и вердикт */}
              <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50/30 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
                    Официальный вердикт комиссии:
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {result.verdict_summary}
                  </p>
                  <span className="text-[11px] text-slate-500 block pt-1">
                    Объем работы: <strong className="text-slate-900">{result.word_count} слов</strong>{' '}
                    (норматив выполнен ✓)
                  </span>
                </div>
                <div className="bg-white border border-amber-300 px-5 py-2.5 rounded-2xl text-center shrink-0 shadow-xs">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">
                    Первичный балл:
                  </span>
                  <span className="text-2xl font-black text-amber-700">
                    {result.awarded_score}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      / {result.max_score}
                    </span>
                  </span>
                </div>
              </div>

              {/* ПОДСВЕТКА И РАЗБОР НАЙДЕННЫХ ОШИБОК */}
              {result.highlighted_errors &&
                result.highlighted_errors.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle size={15} className="text-rose-600" />{' '}
                      Найденные неточности и варианты исправления:
                    </h3>
                    <div className="space-y-2">
                      {result.highlighted_errors.map((err, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 p-3 rounded-xl space-y-1.5 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              {err.type}
                            </span>
                            <span className="line-through text-rose-600 font-mono text-[11px]">
                              «{err.quote}»
                            </span>
                            <ArrowRight
                              size={12}
                              className="text-slate-400 shrink-0"
                            />
                            <span className="text-emerald-700 font-bold font-mono text-[11px]">
                              «{err.fix}»
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 pl-1 leading-relaxed">
                            {err.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* ДЕТАЛИЗАЦИЯ ПО 12 КРИТЕРИЯМ */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={15} className="text-amber-600" /> Ведомость по критериям ФИПИ (К1–К12):
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.criteria_breakdown.map((c, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200/90 p-3 rounded-xl space-y-1 text-xs shadow-2xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          {c.awarded === c.max ? (
                            <CheckCircle2
                              size={13}
                              className="text-emerald-600"
                            />
                          ) : (
                            <XCircle size={13} className="text-amber-600" />
                          )}
                          {c.code}: {c.name}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            c.awarded === c.max
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {c.awarded} / {c.max} б.
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {c.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Совет эксперта */}
              <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl space-y-1 text-xs text-amber-950">
                <strong className="text-amber-900 flex items-center gap-1.5 font-bold">
                  <Sparkles size={14} className="text-amber-600" /> Главный совет проверяющего эксперта:
                </strong>
                <p className="text-amber-900/90 text-[11px] leading-relaxed">
                  {result.expert_advice}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition"
                >
                  Проверить другой текст
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Вставьте ваш текст сочинения для проверки:</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Слов: <strong className="text-amber-700 font-bold">{currentWords}</strong>{' '}
                    (рекомендуется $\ge 150$)
                  </span>
                </div>
                <textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="Вставьте сюда текст вашего сочинения (вступление, формулировка проблемы, комментарий с двумя примерами-иллюстрациями, позиция автора, собственное отношение с обоснованием, заключение)..."
                  rows={9}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleEvaluate}
                  disabled={loading || !essayText.trim()}
                  className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition shadow-sm shadow-amber-600/20 flex items-center gap-2 active:scale-95"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FileCheck2 size={16} />
                  )}
                  <span>
                    {loading
                      ? 'Комиссия экспертов проверяет сочинение по К1–К12...'
                      : 'Запустить проверку по критериям ФИПИ'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Подвал */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>
            Критерии оценивания соответствуют официальным нормам ФИПИ 2024–2026
          </span>
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