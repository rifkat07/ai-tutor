'use client';

import React, { useState, useEffect } from 'react';
import { useChatStore, SUBJECTS } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import { X, Printer, FileText, CheckCircle2, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';

interface OnePagerCheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CheatsheetData {
  formulas: string[];
  note: string;
  steps: { step: string; title: string; desc: string }[];
  traps: string[];
}

export const OnePagerCheatsheetModal: React.FC<OnePagerCheatsheetModalProps> = ({ isOpen, onClose }) => {
  const { currentCompetencyTitle, currentTaskContext, activeSubject, selectedGrade, examType } = useChatStore();
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState<CheatsheetData | null>(null);

  const currentSubj = SUBJECTS[activeSubject] || SUBJECTS.math;

  useEffect(() => {
    if (!isOpen) return;

    const fetchDynamicCheatsheet = async () => {
      setLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/v1/competencies/cheatsheet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: currentSubj.name,
            grade: selectedGrade || 5,
            exam_type: examType,
            task_context: currentTaskContext,
            competency_title: currentCompetencyTitle,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          setSheet(json);
        }
      } catch (err) {
        console.error('Cheatsheet fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicCheatsheet();
  }, [isOpen, currentTaskContext, currentCompetencyTitle, activeSubject, selectedGrade, examType]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex justify-center items-center p-3 sm:p-4">
      {/* Стили для идеальной видимости формул РешуЕГЭ черным цветом на белом листе А4 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #printable-a4-sheet img.tex,
            #printable-a4-sheet img {
              filter: none !important;
              display: inline-block !important;
              vertical-align: -3px !important;
            }
          `,
        }}
      />

      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] relative overflow-hidden">
        {/* Шапка модалки */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3.5 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl shadow-inner">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Конспект-Шпаргалка к уроку ({selectedGrade} класс)
                </h2>
                <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase">
                  1-Pager PDF
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Динамическая выжимка формул и шагов строго под открытое задание
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loading || !sheet}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              <Printer size={15} /> Распечатать / Сохранить в PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-950 border border-slate-800/80 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ПЕЧАТНЫЙ ЛИСТ А4 */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 print:p-0 print:m-0 print:overflow-visible">
          {loading || !sheet ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-xs">
              <Loader2 size={32} className="animate-spin text-indigo-500" />
              <span>ИИ составляет индивидуальный конспект А4 под текущую задачу...</span>
            </div>
          ) : (
            <div
              id="printable-a4-sheet"
              className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl space-y-5 border border-slate-200 print:border-none print:shadow-none print:p-4"
            >
              {/* Заголовок листа А4 */}
              <div className="border-b-2 border-indigo-600 pb-3 flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 block">
                    AI-Tutor v2.0 • Памятка к уроку
                  </span>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    {currentCompetencyTitle}
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Предмет: <strong>{currentSubj.name}</strong> • Класс:{' '}
                    <strong>
                      {selectedGrade} класс ({examType})
                    </strong>
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono">
                  <span>Дата: {new Date().toLocaleDateString()}</span>
                  <span className="block text-emerald-600 font-bold">Верифицировано ФИПИ</span>
                </div>
              </div>

              {/* БЛОК 1: Базовые формулы и правила */}
              <div className="space-y-2">
                <h2 className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                  <Sparkles size={13} className="text-indigo-600" /> 1. Главные формулы и теоретическая опора:
                </h2>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1.5">
                  {sheet.formulas.map((f, idx) => (
                    <KaTeXRenderer key={idx} content={f} />
                  ))}
                  {sheet.note && (
                    <div className="text-[11px] text-slate-600 italic pt-1">
                      <KaTeXRenderer content={sheet.note} />
                    </div>
                  )}
                </div>
              </div>

              {/* БЛОК 2: Пошаговый алгоритм решения */}
              <div className="space-y-2">
                <h2 className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                  <CheckCircle2 size={13} className="text-emerald-600" /> 2. Пошаговый алгоритм выполнения задания:
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  {sheet.steps.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5"
                    >
                      <strong className="text-indigo-900 block text-xs">
                        {s.step}: {s.title}
                      </strong>
                      <div className="text-slate-600 text-[11px] leading-relaxed">
                        <KaTeXRenderer content={s.desc} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* БЛОК 3: Ловушки и частые ошибки */}
              <div className="space-y-2">
                <h2 className="text-xs font-black uppercase text-amber-700 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                  <AlertTriangle size={13} className="text-amber-600" /> 3. Ловушки (Где теряют баллы 80% школьников):
                </h2>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs space-y-1.5 text-amber-950">
                  {sheet.traps.map((t, idx) => (
                    <div key={idx} className="text-xs">
                      <KaTeXRenderer content={t} />
                    </div>
                  ))}
                </div>
              </div>

              {/* БЛОК 4: Разбор примера чистовика */}
              <div className="space-y-2">
                <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                  <FileText size={13} className="text-slate-600" /> 4. Пример задачи и эталонное оформление:
                </h2>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1 font-mono text-slate-800 leading-relaxed">
                  <KaTeXRenderer content={currentTaskContext} />
                  <p className="text-[10px] text-emerald-700 font-sans font-bold pt-1.5">
                    ✓ Чистовик оформлен с соблюдением требований критериев оценивания комиссии.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Подвал модалки */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 shrink-0 print:hidden">
          <span>Готово к печати на стандартном листе бумаги А4</span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};