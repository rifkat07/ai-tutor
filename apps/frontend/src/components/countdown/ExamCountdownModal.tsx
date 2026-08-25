'use client';

import React from 'react';
import { useChatStore, SUBJECTS } from '@/store/useChatStore';
import { X, Calendar, Target, Flame, CheckCircle2 } from 'lucide-react';

interface ExamCountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 100% ДИНАМИЧЕСКИЙ РАСЧЕТ ДАТ И ТЕМПА ОТ ТЕКУЩЕГО МОМЕНТА ВРЕМЕНИ
export const getDynamicExamCountdown = (examType: string, selectedGrade: number, pMastery: number = 0.35) => {
  const now = new Date();
  let targetYear = now.getFullYear();

  // Параметры экзаменов: месяц (0-11) и день старта официальной волны Рособрнадзора
  let targetMonth = 4; // Май по умолчанию
  let targetDay = 26; // 26 мая ЕГЭ
  let totalTopics = 24;

  if (examType === 'EGE') {
    targetMonth = 4; // Май
    targetDay = 26; // 26 мая
    totalTopics = 24;
  } else if (examType === 'OGE') {
    targetMonth = 4; // Май
    targetDay = 24; // 24 мая
    totalTopics = 18;
  } else {
    // Школьные проверочные ВПР и четвертные
    targetMonth = 3; // Апрель
    targetDay = 15; // 15 апреля
    totalTopics = 12;
  }

  let targetDate = new Date(targetYear, targetMonth, targetDay);

  // Если дата в этом году уже прошла (лето/осень) — переключаем отсчет на следующий год
  if (now.getTime() > targetDate.getTime()) {
    targetDate = new Date(targetYear + 1, targetMonth, targetDay);
  }

  const diffMs = targetDate.getTime() - now.getTime();
  const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));

  // Динамический расчет оставшихся тем по модели BKT
  const remainingTopics = Math.max(1, Math.round(totalTopics * (1.0 - pMastery)));
  const pacePerWeek = Math.max(1, Math.ceil(remainingTopics / weeksLeft));
  const studyHoursPerWeek = Math.max(2, Math.min(10, pacePerWeek * 2));

  let title = `ЕГЭ 11 класс (${targetDate.getFullYear()} год)`;
  let targetScore = '80+ баллов';

  if (examType === 'OGE') {
    title = `ОГЭ 9 класс (${targetDate.getFullYear()} год)`;
    targetScore = 'Оценка 5 (Отлично)';
  } else if (examType === 'SCHOOL') {
    title = `${selectedGrade} класс • ВПР и Контрольные (${targetDate.getFullYear()} год)`;
    targetScore = 'Оценка 5 за четверть';
  }

  return {
    title,
    daysLeft,
    weeksLeft,
    recommendedPace: `${pacePerWeek} ${pacePerWeek === 1 ? 'тема' : pacePerWeek < 5 ? 'темы' : 'тем'} в неделю`,
    studyTimeWeek: `${studyHoursPerWeek}–${studyHoursPerWeek + 1} ч. в неделю`,
    targetScore,
    milestones: [
      {
        week: `1–${Math.max(2, Math.round(weeksLeft / 3))} нед`,
        goal: examType === 'EGE' ? 'Закрыть базовую часть на 100%' : 'Ликвидировать текущие пробелы',
        done: pMastery >= 0.45,
      },
      {
        week: `${Math.round(weeksLeft / 3) + 1}–${Math.round((weeksLeft * 2) / 3)} нед`,
        goal: examType === 'EGE' ? 'Отработать Задания №13 (Уравнения) и №15 (Неравенства)' : 'Отработать сложные задачи 2-й части',
        done: pMastery >= 0.70,
      },
      {
        week: `${Math.round((weeksLeft * 2) / 3) + 1}–${weeksLeft} нед`,
        goal: examType === 'EGE' ? 'Штурм задач №18 (Параметры) и №17 (Геометрия)' : 'Финальные пробники на максимум',
        done: pMastery >= 0.85,
      },
    ],
  };
};

export const ExamCountdownModal: React.FC<ExamCountdownModalProps> = ({ isOpen, onClose }) => {
  const { examType, selectedGrade, activeSubject, pMastery } = useChatStore();

  if (!isOpen) return null;

  const currentSubject = SUBJECTS[activeSubject] || SUBJECTS.math;
  const info = getDynamicExamCountdown(examType, selectedGrade, pMastery);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex justify-center items-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden">
        
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl shadow-inner">
              <Calendar size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Динамический Трекер Дедлайна & Темпа
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{info.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          
          {/* Главные счетчики обратного отсчета */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Дней до старта:</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">
                {info.daysLeft} <span className="text-xs font-semibold text-slate-400">дн</span>
              </p>
              <span className="text-[10px] text-slate-500 block">({info.weeksLeft} нед. по календарю)</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Целевой балл:</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">{info.targetScore}</p>
              <span className="text-[10px] text-emerald-500/80 block">Текущий уровень: {Math.round(pMastery * 100)}%</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Расчетный темп:</span>
              <p className="text-sm font-extrabold text-indigo-300 mt-1">{info.recommendedPace}</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">{info.studyTimeWeek}</span>
            </div>
          </div>

          {/* Стратегический план по неделям */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Target size={15} className="text-amber-400" /> Этапы подготовки (Контрольные вехи):
              </h3>
              <span className="text-[10px] text-slate-400">Расчет от твоего знания</span>
            </div>

            <div className="space-y-2">
              {info.milestones.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                    m.done
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-amber-400 font-bold">
                      {m.week}
                    </span>
                    <span className="font-medium">{m.goal}</span>
                  </div>
                  {m.done ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Освоено
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 shrink-0">В процессе</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Совет по тайм-менеджменту */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 p-4 rounded-2xl flex items-start gap-3">
            <Flame size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs text-slate-300">
              <p className="font-bold text-white">Динамический расчет темпа:</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Чтобы закрыть все темы до старта экзамена, удерживай темп **{info.recommendedPace}**. Каждая решенная задача снижает недельную нагрузку!
              </p>
            </div>
          </div>

        </div>

        {/* Подвал */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 shrink-0">
          <span>{currentSubject.name} • {selectedGrade} класс</span>
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            Продолжить урок
          </button>
        </div>

      </div>
    </div>
  );
};