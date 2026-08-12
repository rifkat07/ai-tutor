'use client';

import React, { useState } from 'react';
import { Scratchpad } from '@/components/scratchpad/Scratchpad';
import { ChatBox } from '@/components/chat/ChatBox';
import { KaTeXRenderer } from '@/components/math/KaTeXRenderer';
import { TaskBankModal } from '@/components/tasks/TaskBankModal';
import { TextbookModal } from '@/components/textbooks/TextbookModal';
import { TaskTheoryModal } from '@/components/theory/TaskTheoryModal';
import { ExamTacticsModal } from '@/components/tactics/ExamTacticsModal';
import { useChatStore, SUBJECTS, SubjectType } from '@/store/useChatStore';
import {
  BookOpen,
  Sparkles,
  GraduationCap,
  AlertTriangle,
  Target,
  FileText,
  Clock,
  Flame,
} from 'lucide-react';

export default function TutorPage() {
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isTextbookModalOpen, setIsTextbookModalOpen] = useState(false);
  const [isTheoryModalOpen, setIsTheoryModalOpen] = useState(false);
  const [isTacticsModalOpen, setIsTacticsModalOpen] = useState(false);

  const {
    activeSubject,
    setSubject,
    examType,
    schoolSubMode,
    setSchoolSubMode,
    selectedGrade,
    setSelectedGrade,
    currentTaskContext,
    currentCompetencyTitle,
    generateSimilarTask,
    microWins,
  } = useChatStore();

  const subjectInfo = SUBJECTS[activeSubject] || SUBJECTS.math;

  // ТОРЖЕСТВЕННЫЙ ИСПРАВЛЕННЫЙ ФИЛЬТР: Показываем предмет СТРОГО если selectedGrade входит в [minGrade ... maxGrade]
  const availableSubjects = Object.values(SUBJECTS).filter(
    (subj) => selectedGrade >= (subj.minGrade || 5) && selectedGrade <= (subj.maxGrade || 11)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
        {/* Левая панель */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          
          {/* ЕСЛИ ВЫБРАН РАЗДЕЛ ШКОЛЬНЫЙ РЕПЕТИТОР — ПОКАЗЫВАЕМ ПОД-ВКЛАДКИ И КЛАССЫ */}
          {examType === 'SCHOOL' && (
            <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-xl shadow-lg space-y-3">
              {/* Переключатель 2 Под-Вкладок: Репетиторство vs Домашнее задание */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
                <button
                  onClick={() => setSchoolSubMode('HOMEWORK')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    schoolSubMode === 'HOMEWORK'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText size={14} /> 📝 Домашнее задание (По учебникам)
                </button>
                <button
                  onClick={() => setSchoolSubMode('TUTORING')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    schoolSubMode === 'TUTORING'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Target size={14} /> 🎯 Репетиторство (Уроки по темам)
                </button>
              </div>

              {/* Фильтр Классов (5–11 кл) */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <GraduationCap size={16} className="text-emerald-400" /> Класс:
                </span>
                <div className="flex gap-1 overflow-x-auto">
                  {[5, 6, 7, 8, 9, 10, 11].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        selectedGrade === grade
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {grade} кл
                    </button>
                  ))}
                </div>
              </div>

              {/* ТОЧНЫЕ КНОПКИ ПРЕДМЕТОВ (Без пустых карточек) */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/60 overflow-x-auto">
                <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">Предметы:</span>
                {availableSubjects.map((subj) => (
                  <button
                    key={subj.id}
                    onClick={() => setSubject(subj.id as SubjectType)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                      activeSubject === subj.id
                        ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300 font-semibold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{subj.icon}</span> {subj.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Карточка текущего Упражнения / Задачи */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg relative">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{subjectInfo.icon}</span>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  {currentCompetencyTitle}
                </span>

                <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                  <Flame size={12} /> {microWins || 3} шага подряд!
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsTacticsModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition font-medium"
                >
                  <Clock size={14} /> Тактика и Время
                </button>

                <button
                  onClick={() => setIsTheoryModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition font-medium"
                >
                  <AlertTriangle size={14} /> Теория и Ловушки
                </button>

                <button
                  onClick={generateSimilarTask}
                  className="flex items-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition font-medium"
                >
                  <Sparkles size={14} /> Похожая
                </button>

                {examType === 'SCHOOL' ? (
                  <button
                    onClick={() => setIsTextbookModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition font-medium"
                  >
                    <GraduationCap size={14} /> База Учебников
                  </button>
                ) : (
                  <button
                    onClick={() => setIsBankModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs bg-blue-600/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-600/20 transition font-medium"
                  >
                    <BookOpen size={14} /> Банк {examType}
                  </button>
                )}
              </div>
            </div>

            <div className="text-base md:text-lg font-medium leading-relaxed">
              <KaTeXRenderer content={currentTaskContext} />
            </div>
          </div>

          <Scratchpad />
        </div>

        {/* Правая панель: Сократовский чат */}
        <div className="h-[calc(100vh-100px)]">
          <ChatBox />
        </div>
      </main>

      <TaskBankModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} />
      <TextbookModal isOpen={isTextbookModalOpen} onClose={() => setIsTextbookModalOpen(false)} />
      <TaskTheoryModal isOpen={isTheoryModalOpen} onClose={() => setIsTheoryModalOpen(false)} />
      <ExamTacticsModal isOpen={isTacticsModalOpen} onClose={() => setIsTacticsModalOpen(false)} />
    </div>
  );
}