'use client';

import React, { useState } from 'react';
import { useChatStore, MistakeItem } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import { X, Brain, CheckCircle2, Clock, Target } from 'lucide-react';

interface MistakesBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MistakesBankModal: React.FC<MistakesBankModalProps> = ({ isOpen, onClose }) => {
  const { mistakesBank, setTaskContext, resolveMistake, addMessage } = useChatStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved' | 'all'>('pending');

  if (!isOpen) return null;

  const now = Date.now();

  const unresolvedMistakes = mistakesBank.filter((m) => !m.isResolved);
  const resolvedMistakes = mistakesBank.filter((m) => m.isResolved);

  const displayedList =
    activeTab === 'pending'
      ? unresolvedMistakes
      : activeTab === 'resolved'
      ? resolvedMistakes
      : mistakesBank;

  const handleStartReview = (mistake: MistakeItem) => {
    setTaskContext(
      mistake.taskContext,
      `🧠 Интервальный повтор: ${mistake.competencyTitle}`,
      0.3
    );

    addMessage({
      id: `${Date.now()}-mst-start`,
      sender: 'assistant',
      text: `🧠 **Запущен интервальный повтор по кривой Эббингауза!**\n\nТема: *«${mistake.competencyTitle}»*\nДавай решим эту задачу без ошибок, чтобы навсегда закрыть этот пробел!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-3xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden text-slate-900">
        
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl shadow-inner">
              <Brain size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Банк Моих Ошибок & Интервальный Повтор
                </h2>
                <span className="text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full uppercase">
                  Кривая Эббингауза
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Автоматическая очередь задач с ошибками для закрепления через 3 и 7 дней
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

        {/* Табы фильтрации */}
        <div className="flex gap-2 py-3 border-b border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock size={13} /> Требуют повторения ({unresolvedMistakes.length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'resolved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CheckCircle2 size={13} /> Закрытые пробелы ({resolvedMistakes.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Все ({mistakesBank.length})
          </button>
        </div>

        {/* Список задач с ошибками */}
        <div className="flex-1 overflow-y-auto space-y-3.5 py-4 pr-1">
          {displayedList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2 bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-1" />
              <p className="font-bold text-slate-800">В этой вкладке нет задач!</p>
              <p className="text-[11px] text-slate-500">
                Задачи автоматически попадают сюда, если при решении возникает ошибка или берется «Сильная подсказка».
              </p>
            </div>
          ) : (
            displayedList.map((mistake) => {
              const isDue = now >= mistake.nextReviewDate && !mistake.isResolved;
              const daysUntil = Math.max(1, Math.ceil((mistake.nextReviewDate - now) / (1000 * 60 * 60 * 24)));

              return (
                <div
                  key={mistake.id}
                  className={`bg-slate-50/70 border p-4 rounded-2xl flex flex-col gap-3 transition shadow-2xs ${
                    mistake.isResolved
                      ? 'border-emerald-200 bg-emerald-50/30 opacity-80'
                      : isDue
                      ? 'border-rose-300 bg-rose-50/40 ring-1 ring-rose-300'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-white border border-slate-200 text-slate-700 shadow-2xs">
                        {mistake.grade} класс • {mistake.subject}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{mistake.competencyTitle}</span>
                      <span className="text-[10px] text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                        Ошибок: {mistake.mistakeCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {mistake.isResolved ? (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <CheckCircle2 size={13} /> Навык закреплен
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartReview(mistake)}
                          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs active:scale-95"
                        >
                          <Target size={14} /> Закрыть пробел
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Текст задачи с формулами */}
                  <div className="text-xs text-slate-900 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs font-sans">
                    <KaTeXRenderer content={mistake.taskContext} />
                  </div>

                  {/* Статус интервала Эббингауза */}
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> Зафиксировано: {new Date(mistake.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold">
                      {mistake.isResolved
                        ? 'Пробел устранен'
                        : isDue
                        ? '🔥 Пора повторить прямо сейчас!'
                        : `⏳ Повтор по графику через ${daysUntil} дн.`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Подвал */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>Регулярный интервальный повтор закрепляет 95% знаний в памяти</span>
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