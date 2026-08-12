'use client';

import React from 'react';
import { useChatStore } from '@/store/useChatStore';
import { X, Clock, CheckSquare, ShieldCheck, Flame } from 'lucide-react';

interface ExamTacticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExamTacticsModal: React.FC<ExamTacticsModalProps> = ({ isOpen, onClose }) => {
  const { currentCompetencyTitle, examType } = useChatStore();

  if (!isOpen) return null;

  const TACTICS_DATA = {
    title: currentCompetencyTitle,
    recommendedTime: examType === 'EGE' ? '20–25 минут' : (examType === 'OGE' ? '12–15 минут' : '10 минут'),
    fipiChecklist: [
      'Обязательно пропишите ОДЗ или ограничения на первой строчке черновика.',
      'При решении тригонометрии укажите принадлежность $k, n \\in \\mathbb{Z}$.',
      'В пункте «б» чётко покажите метод отбора корней (через окружность или двойное неравенство).',
    ],
    examStrategy: 'Если вы застряли на этой задаче больше 15 минут — отложите её, перейдите к более простым заданиям первой части, а затем вернитесь к ней со свежей головой!',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="text-amber-400" size={22} />
            <div>
              <h2 className="text-base font-bold text-white">Тактика и Время ({examType})</h2>
              <p className="text-xs text-slate-400">{TACTICS_DATA.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Рекомендуемое время */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Рекомендуемое время на экзамене:</span>
            <span className="text-xs font-bold px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg flex items-center gap-1">
              <Clock size={14} /> {TACTICS_DATA.recommendedTime}
            </span>
          </div>

          {/* Чек-лист ФИПИ */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <ShieldCheck size={16} /> Чек-лист чистовика ФИПИ (Чтобы не сняли баллы):
            </h3>
            <ul className="space-y-1.5 pl-2">
              {TACTICS_DATA.fipiChecklist.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <CheckSquare size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Стратегия */}
          <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl space-y-1.5">
            <h3 className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
              <Flame size={16} className="text-amber-400" /> Тактическая мудрость:
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{TACTICS_DATA.examStrategy}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-xs transition"
        >
          Понятно, к задаче!
        </button>
      </div>
    </div>
  );
};