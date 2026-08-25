'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Scratchpad } from '@/components/scratchpad/Scratchpad';
import { ChatBox } from '@/components/chat/ChatBox';
import { KaTeXRenderer } from '@/components/math/KaTeXRenderer';
import { TaskBankModal } from '@/components/tasks/TaskBankModal';
import { TextbookModal } from '@/components/textbooks/TextbookModal';
import { KnowledgeHubModal, KnowledgeTab } from '@/components/knowledge/KnowledgeHubModal';
import { MistakesBankModal } from '@/components/mistakes/MistakesBankModal';
import { FipiScoringModal } from '@/components/fipi/FipiScoringModal';
import { SdamgiaImportModal } from '@/components/tasks/SdamgiaImportModal';
import { KegeEmulatorModal } from '@/components/kege/KegeEmulatorModal';
import { EssayScoringModal } from '@/components/essay/EssayScoringModal';
import { FinalAnswerCheck } from '@/components/tasks/FinalAnswerCheck';
import { NextActionWidget } from '@/components/recommendations/NextActionWidget';
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
  FileSpreadsheet,
  Brain,
  ShieldCheck,
  Printer,
  DownloadCloud,
  Laptop,
  Code2,
  FileCheck2,
  ChevronDown,
  FolderOpen,
  Lightbulb,
  Pencil,
} from 'lucide-react';

export default function TutorPage() {
  // 1. ВКЛАДКИ ЛЕВОЙ ПАНЕЛИ: «Задание и Решение» vs «Полноэкранный Черновик»
  const [leftPanelTab, setLeftPanelTab] = useState<'task' | 'canvas'>('task');

  // 2. МОДАЛЬНЫЕ ОКНА
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isTextbookModalOpen, setIsTextbookModalOpen] = useState(false);
  const [isKnowledgeHubOpen, setIsKnowledgeHubOpen] = useState(false);
  const [knowledgeHubTab, setKnowledgeHubTab] = useState<KnowledgeTab>('theory');
  const [isMistakesModalOpen, setIsMistakesModalOpen] = useState(false);
  const [isFipiModalOpen, setIsFipiModalOpen] = useState(false);
  const [isSdamgiaModalOpen, setIsSdamgiaModalOpen] = useState(false);
  const [isKegeModalOpen, setIsKegeModalOpen] = useState(false);
  const [isEssayModalOpen, setIsEssayModalOpen] = useState(false);

  // Выпадающие хабы кнопок
  const [openHub, setOpenHub] = useState<'sources' | 'knowledge' | 'assessment' | null>(null);
  const hubsRef = useRef<HTMLDivElement | null>(null);

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
    mistakesBank,
  } = useChatStore();

  const subjectInfo = SUBJECTS[activeSubject] || SUBJECTS.math;

  const availableSubjects = Object.values(SUBJECTS).filter(
    (subj) => selectedGrade >= (subj.minGrade || 5)
  );

  const unresolvedMistakesCount = mistakesBank.filter((m) => !m.isResolved).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hubsRef.current && !hubsRef.current.contains(event.target as Node)) {
        setOpenHub(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openKnowledgeTab = (tab: KnowledgeTab) => {
    setKnowledgeHubTab(tab);
    setIsKnowledgeHubOpen(true);
    setOpenHub(null);
  };

  return (
    <div className="h-[calc(100dvh-65px)] bg-slate-100/80 text-slate-900 flex flex-col overflow-hidden">
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 overflow-hidden h-full">
        
        {/* ЛЕВАЯ ПАНЕЛЬ С ПЕРЕКЛЮЧАТЕЛЕМ ВКЛАДОК */}
        <div className="flex flex-col gap-3 overflow-hidden h-full">
          
          {/* ВКЛАДКИ ПЕРЕКЛЮЧЕНИЯ РЕЖИМА ЛЕВОЙ ПАНЕЛИ */}
          <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shrink-0 gap-1.5 shadow-sm">
            <button
              onClick={() => setLeftPanelTab('task')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition ${
                leftPanelTab === 'task'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText size={14} /> 📝 Задание и Проверка
            </button>
            <button
              onClick={() => setLeftPanelTab('canvas')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition ${
                leftPanelTab === 'canvas'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Pencil size={14} /> 🎨 Полноэкранный Черновик
            </button>
          </div>

          {/* СОДЕРЖИМОЕ ВКЛАДКИ 1: ЗАДАНИЕ И ПРОВЕРКА */}
          {leftPanelTab === 'task' ? (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              
              {/* Виджет рекомендаций */}
              <div className="shrink-0">
                <NextActionWidget />
              </div>

              {/* Школьная панель */}
              {examType === 'SCHOOL' && (
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3 shrink-0">
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                    <button
                      onClick={() => setSchoolSubMode('HOMEWORK')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        schoolSubMode === 'HOMEWORK'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText size={14} /> 📝 Домашнее задание (По учебникам)
                    </button>
                    <button
                      onClick={() => setSchoolSubMode('TUTORING')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        schoolSubMode === 'TUTORING'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Target size={14} /> 🎯 Репетиторство (Уроки по темам)
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <GraduationCap size={16} className="text-emerald-600" /> Класс:
                    </span>
                    <div className="flex gap-1 overflow-x-auto">
                      {[5, 6, 7, 8, 9, 10, 11].map((grade) => (
                        <button
                          key={grade}
                          onClick={() => setSelectedGrade(grade)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            selectedGrade === grade
                              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {grade} кл
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 overflow-x-auto">
                    <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Предметы:</span>
                    {availableSubjects.map((subj) => (
                      <button
                        key={subj.id}
                        onClick={() => setSubject(subj.id as SubjectType)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                          activeSubject === subj.id
                            ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{subj.icon}</span> {subj.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Карточка задачи с 3 Хабами кнопок */}
              <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm relative shrink-0">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{subjectInfo.icon}</span>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {currentCompetencyTitle}
                    </span>

                    <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                      <Flame size={12} className="text-amber-500 fill-amber-500" /> {microWins || 3} шага подряд!
                    </span>
                  </div>

                  {/* 🗂️ 3 ХАБА КНОПОК */}
                  <div ref={hubsRef} className="flex items-center gap-1.5 flex-wrap">
                    
                    {/* 1. ХАБ ВЫБОРА ЗАДАЧИ */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenHub(openHub === 'sources' ? null : 'sources')}
                        className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-xl transition font-bold ${
                          openHub === 'sources'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <FolderOpen size={14} className={openHub === 'sources' ? 'text-white' : 'text-blue-600'} />
                        <span>Выбрать задачу</span>
                        <ChevronDown size={13} className={`transition-transform ${openHub === 'sources' ? 'rotate-180' : ''}`} />
                      </button>

                      {openHub === 'sources' && (
                        <div className="absolute left-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in duration-150">
                          {examType === 'SCHOOL' ? (
                            <button
                              onClick={() => { setIsTextbookModalOpen(true); setOpenHub(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-emerald-700 hover:bg-slate-50 rounded-xl transition font-bold text-left"
                            >
                              <GraduationCap size={15} className="text-emerald-600" />
                              <span>Учебники ({selectedGrade} класс)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => { setIsBankModalOpen(true); setOpenHub(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-indigo-700 hover:bg-slate-50 rounded-xl transition font-bold text-left"
                            >
                              <BookOpen size={15} className="text-indigo-600" />
                              <span>Банк заданий {examType}</span>
                            </button>
                          )}

                          <button
                            onClick={() => { setIsSdamgiaModalOpen(true); setOpenHub(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition text-left font-medium"
                          >
                            <DownloadCloud size={15} className="text-blue-600" />
                            <span>Варианты РешуЕГЭ / СдамГИА</span>
                          </button>

                          <button
                            onClick={() => { setIsBankModalOpen(true); setOpenHub(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition text-left font-medium"
                          >
                            <BookOpen size={15} className="text-slate-500" />
                            <span>Каталог заданий КИМ</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 2. ХАБ БАЗЫ ЗНАНИЙ */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenHub(openHub === 'knowledge' ? null : 'knowledge')}
                        className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-xl transition font-bold ${
                          openHub === 'knowledge'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <Lightbulb size={14} className={openHub === 'knowledge' ? 'text-white' : 'text-amber-500'} />
                        <span>База Знаний</span>
                        <ChevronDown size={13} className={`transition-transform ${openHub === 'knowledge' ? 'rotate-180' : ''}`} />
                      </button>

                      {openHub === 'knowledge' && (
                        <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in duration-150">
                          <button
                            onClick={() => openKnowledgeTab('theory')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-700 hover:bg-slate-50 rounded-xl transition font-bold text-left"
                          >
                            <AlertTriangle size={15} className="text-amber-500" />
                            <span>Теория & Ловушки задачи</span>
                          </button>

                          <button
                            onClick={() => openKnowledgeTab('cheatsheet')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition text-left font-medium"
                          >
                            <Printer size={15} className="text-indigo-600" />
                            <span>Конспект-шпаргалка А4 (Печать)</span>
                          </button>

                          <button
                            onClick={() => openKnowledgeTab('reference')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition text-left font-medium"
                          >
                            <FileSpreadsheet size={15} className="text-emerald-600" />
                            <span>Справочник формул КИМ</span>
                          </button>

                          <button
                            onClick={() => openKnowledgeTab('tactics')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition text-left font-medium"
                          >
                            <Clock size={15} className="text-amber-500" />
                            <span>Тактика времени на экзамене</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 3. ХАБ ЭКСПЕРТИЗЫ */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenHub(openHub === 'assessment' ? null : 'assessment')}
                        className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-xl transition font-bold ${
                          openHub === 'assessment'
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                            : unresolvedMistakesCount > 0
                            ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/80 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <ShieldCheck size={14} className={unresolvedMistakesCount > 0 ? 'text-rose-500 animate-pulse' : openHub === 'assessment' ? 'text-white' : 'text-indigo-600'} />
                        <span>Экспертиза</span>
                        {unresolvedMistakesCount > 0 && (
                          <span className="text-[10px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded-full ml-0.5">
                            {unresolvedMistakesCount}
                          </span>
                        )}
                        <ChevronDown size={13} className={`transition-transform ${openHub === 'assessment' ? 'rotate-180' : ''}`} />
                      </button>

                      {openHub === 'assessment' && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in duration-150">
                          <button
                            onClick={() => { setIsFipiModalOpen(true); setOpenHub(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-indigo-700 hover:bg-slate-50 rounded-xl transition font-bold text-left"
                          >
                            <ShieldCheck size={15} className="text-indigo-600" />
                            <span>Экспертиза чистовика ФИПИ (0–4 б)</span>
                          </button>

                          <button
                            onClick={() => { setIsMistakesModalOpen(true); setOpenHub(null); }}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition text-left font-medium"
                          >
                            <span className="flex items-center gap-2.5">
                              <Brain size={15} className="text-rose-500" />
                              <span>Банк Моих Ошибок</span>
                            </span>
                            {unresolvedMistakesCount > 0 && (
                              <span className="text-[10px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                                {unresolvedMistakesCount}
                              </span>
                            )}
                          </button>

                          {(activeSubject === 'cs' || examType === 'EGE') && (
                            <button
                              onClick={() => { setIsKegeModalOpen(true); setOpenHub(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-cyan-700 hover:bg-slate-50 rounded-xl transition text-left font-bold"
                            >
                              {examType === 'EGE' || selectedGrade >= 10 ? (
                                <>
                                  <Laptop size={15} className="text-cyan-600" />
                                  <span>Станция КЕГЭ (Информатика)</span>
                                </>
                              ) : (
                                <>
                                  <Code2 size={15} className="text-emerald-600" />
                                  <span>Редактор Python</span>
                                </>
                              )}
                            </button>
                          )}

                          {activeSubject === 'russian' && (
                            <button
                              onClick={() => { setIsEssayModalOpen(true); setOpenHub(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-700 hover:bg-slate-50 rounded-xl transition text-left font-bold"
                            >
                              <FileCheck2 size={15} className="text-amber-600" />
                              <span>Проверка Сочинения (К1–К12)</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 4. КНОПКА ПОХОЖЕЙ ЗАДАЧИ */}
                    <button
                      onClick={generateSimilarTask}
                      className="flex items-center gap-1.5 text-xs bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-xl transition font-bold shadow-sm"
                    >
                      <Sparkles size={14} className="text-blue-600" />
                      <span>Похожая</span>
                    </button>
                  </div>
                </div>

                {/* Условие задачи */}
                <div className="text-base md:text-lg font-semibold leading-relaxed text-slate-900">
                  <KaTeXRenderer content={currentTaskContext} />
                </div>

                {/* БЛОК ПРОВЕРКИ ИТОГОВОГО ОТВЕТА */}
                <FinalAnswerCheck />
              </div>

              {/* Компактный черновик внизу карточки */}
              <div className="shrink-0">
                <Scratchpad />
              </div>
            </div>
          ) : (
            /* СОДЕРЖИМОЕ ВКЛАДКИ 2: ПОЛНОЭКРАННЫЙ ЧЕРНОВИК */
            <div className="flex-1 flex flex-col gap-2 overflow-hidden h-full">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl shrink-0 flex items-center justify-between text-xs gap-3 shadow-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-bold text-indigo-600 shrink-0">{currentCompetencyTitle}:</span>
                  <div className="truncate text-slate-700 font-medium">
                    <KaTeXRenderer content={currentTaskContext.slice(0, 100) + '...'} />
                  </div>
                </div>
                <button
                  onClick={() => setLeftPanelTab('task')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm shrink-0"
                >
                  К задаче
                </button>
              </div>

              <div className="flex-1 h-full overflow-hidden">
                <Scratchpad fullscreen={true} />
              </div>
            </div>
          )}

        </div>

        {/* Правая панель: Сократовский чат */}
        <div className="h-full overflow-hidden">
          <ChatBox />
        </div>
      </main>

      {/* МОДАЛЬНЫЕ ОКНА */}
      <TaskBankModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} />
      <TextbookModal isOpen={isTextbookModalOpen} onClose={() => setIsTextbookModalOpen(false)} />
      <KnowledgeHubModal isOpen={isKnowledgeHubOpen} onClose={() => setIsKnowledgeHubOpen(false)} initialTab={knowledgeHubTab} />
      <MistakesBankModal isOpen={isMistakesModalOpen} onClose={() => setIsMistakesModalOpen(false)} />
      <FipiScoringModal isOpen={isFipiModalOpen} onClose={() => setIsFipiModalOpen(false)} />
      <SdamgiaImportModal isOpen={isSdamgiaModalOpen} onClose={() => setIsSdamgiaModalOpen(false)} />
      <KegeEmulatorModal isOpen={isKegeModalOpen} onClose={() => setIsKegeModalOpen(false)} />
      <EssayScoringModal isOpen={isEssayModalOpen} onClose={() => setIsEssayModalOpen(false)} />
    </div>
  );
}